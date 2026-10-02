"""Ask AI: answer natural-language questions about tickets.

Flow: question -> LLM returns a JSON QueryPlan -> Pydantic validates it ->
the backend runs it with the ticket repository -> the LLM turns ONLY those
results into a conversational reply -> the reply is checked against them.

The LLM never writes SQL. The reply must use the real total and may only cite
tickets that were fetched; otherwise a templated answer is used instead.

For intent "create" the LLM only drafts a ticket. Nothing is written here: the
user confirms the draft in the UI, which calls the normal create endpoint.
"""

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Protocol

from pydantic import ValidationError

from app.constants.assistant import (
    DEFAULT_GROUP_BY,
    ANSWER_SYSTEM_PROMPT,
    DRAFT_SYSTEM_PROMPT,
    PLANNER_SYSTEM_PROMPT,
    AssistantIntent,
    AssistantMessages,
    DateRange,
)
from app.constants.messages import ErrorMessages
from app.core.config import Settings
from app.exceptions.errors import AIUnavailableError
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository, build_filters
from app.schemas.assistant import AskResponse, QueryPlan, TicketDraft
from app.schemas.ticket import TicketRead
from app.services.llm_client import chat_completion
from app.utilities.dates import date_range_start
from app.utilities.text import label

logger = logging.getLogger(__name__)

_CITATION = re.compile(r"#(\d+)")
_NOTHING = re.compile(r"\b(no|none|zero|0)\b", re.IGNORECASE)
_DATE_PHRASES = {
    DateRange.TODAY: "from today",
    DateRange.LAST_7_DAYS: "from the last 7 days",
    DateRange.LAST_30_DAYS: "from the last 30 days",
}


class AssistantLLM(Protocol):
    """The two LLM calls the assistant makes. Both return None on any failure."""

    async def plan_query(self, question: str) -> str | None: ...

    async def compose_answer(self, question: str, facts: dict) -> str | None: ...

    async def draft_ticket(self, question: str) -> str | None: ...


def wrap_question(question: str) -> str:
    """Put the user's text in <question> tags, neutralising any tags inside it."""
    safe = question.replace("<", "‹").replace(">", "›")
    return f"<question>{safe}</question>"


class GroqAssistantLLM:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def plan_query(self, question: str) -> str | None:
        return await chat_completion(
            self.settings,
            [
                {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
                {"role": "user", "content": wrap_question(question)},
            ],
            temperature=0,
        )

    async def compose_answer(self, question: str, facts: dict) -> str | None:
        # Grounding: the model sees ONLY the query results, never the database
        return await chat_completion(
            self.settings,
            [
                {"role": "system", "content": ANSWER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"<facts>{json.dumps(facts)}</facts>\n{wrap_question(question)}",
                },
            ],
            json_mode=False,
        )


    async def draft_ticket(self, question: str) -> str | None:
        return await chat_completion(
            self.settings,
            [
                {"role": "system", "content": DRAFT_SYSTEM_PROMPT},
                {"role": "user", "content": wrap_question(question)},
            ],
        )


def parse_plan(raw: str) -> QueryPlan | None:
    """Validate the planner's JSON. Returns None if it is not a usable plan."""
    try:
        return QueryPlan.model_validate_json(raw)
    except ValidationError as exc:
        logger.warning("Assistant returned an invalid plan: %s", exc.errors(include_url=False))
        return None


def parse_draft(raw: str | None) -> TicketDraft | None:
    """Validate the drafted ticket. Returns None if the LLM failed or the draft is unusable."""
    if raw is None:
        return None
    try:
        return TicketDraft.model_validate_json(raw)
    except ValidationError as exc:
        logger.warning("Assistant returned an invalid draft: %s", exc.errors(include_url=False))
        return None


def grounded_reply(text: str | None, plan: QueryPlan, result: "PlanResult") -> str | None:
    """Accept the LLM's reply only if it sticks to the query results.

    - every #id it cites must be a fetched ticket
    - a summary must cite at least one ticket
    - otherwise it must state the real total (or say "no/none" when it is 0)
    """
    if not text or not text.strip():
        return None
    text = text.strip()
    cited = {int(n) for n in _CITATION.findall(text)}
    fetched = {t.id for t in result.tickets}

    if not cited <= fetched:
        ok = False
    elif plan.intent is AssistantIntent.SUMMARIZE and result.tickets:
        ok = bool(cited)
    elif result.total == 0:
        ok = bool(_NOTHING.search(text))
    else:
        ok = re.search(rf"\b{result.total}\b", text) is not None

    if not ok:
        logger.warning("Rejected ungrounded reply: cited=%s fetched=%s total=%s", cited, fetched, result.total)
        return None
    return text


def describe(plan: QueryPlan, count: int) -> str:
    """'open urgent-priority billing tickets matching "refund" from the last 7 days'"""
    words = [label(v).lower() for v in (plan.status, plan.category) if v]
    if plan.priority:
        words.insert(1 if plan.status else 0, f"{plan.priority.value}-priority")
    phrase = " ".join([*words, "ticket" if count == 1 else "tickets"])
    if plan.q:
        phrase += f' matching "{plan.q}"'
    if plan.date_range:
        phrase += f" {_DATE_PHRASES[plan.date_range]}"
    return phrase


@dataclass
class PlanResult:
    total: int
    tickets: list[Ticket] = field(default_factory=list)
    stats: dict[str, int] | None = None


class AssistantService:
    def __init__(self, repository: TicketRepository, llm: AssistantLLM):
        self.repository = repository
        self.llm = llm

    async def ask(self, question: str) -> AskResponse:
        raw = await self.llm.plan_query(question)
        if raw is None:
            raise AIUnavailableError(ErrorMessages.AI_UNAVAILABLE)

        plan = parse_plan(raw)
        if plan is None:
            return AskResponse(answer=AssistantMessages.FALLBACK)

        if plan.intent is AssistantIntent.CREATE:
            return await self.draft(question, plan)

        result = await self.execute_plan(plan)
        answer = await self.build_answer(question, plan, result)
        logger.info("Assistant answered intent=%s total=%s", plan.intent.value, result.total)
        return AskResponse(
            answer=answer,
            plan=plan,
            tickets=[TicketRead.model_validate(t) for t in result.tickets],
            stats=result.stats,
        )

    async def draft(self, question: str, plan: QueryPlan) -> AskResponse:
        """Propose a ticket for the user to confirm. Never writes to the database."""
        draft = parse_draft(await self.llm.draft_ticket(question))
        if draft is None:
            return AskResponse(answer=AssistantMessages.DRAFT_FAILED, plan=plan)
        logger.info(
            "Assistant drafted a ticket category=%s priority=%s",
            draft.category.value,
            draft.priority.value,
        )
        return AskResponse(answer=AssistantMessages.DRAFT_READY, plan=plan, draft=draft)

    async def execute_plan(self, plan: QueryPlan) -> PlanResult:
        filters = {
            "status": plan.status,
            "category": plan.category,
            "priority": plan.priority,
            "q": plan.q,
            "created_after": date_range_start(plan.date_range),
        }

        if plan.intent in (AssistantIntent.LIST, AssistantIntent.SUMMARIZE):
            tickets, total = await self.repository.list(**filters, limit=plan.limit)
            return PlanResult(total=total, tickets=tickets)

        where = build_filters(**filters)
        if plan.intent is AssistantIntent.COUNT:
            return PlanResult(total=await self.repository.count(where))

        stats = await self.repository.count_by(plan.group_by or DEFAULT_GROUP_BY, where)
        return PlanResult(total=sum(stats.values()), stats=stats)

    def template_answer(self, plan: QueryPlan, result: PlanResult) -> str:
        """Plain answer built only from the query results (used when the LLM reply is unusable)."""
        total = result.total

        if plan.intent is AssistantIntent.COUNT:
            return f"There {'is' if total == 1 else 'are'} {total} {describe(plan, total)}."

        if plan.intent is AssistantIntent.STATS:
            if total == 0:
                return f"There are no {describe(plan, 0)} to break down."
            group = plan.group_by or DEFAULT_GROUP_BY
            parts = ", ".join(f"{label(k)}: {v}" for k, v in (result.stats or {}).items())
            return f"{total} {describe(plan, total)} by {group.value}. {parts}."

        if total == 0:
            return f"No {describe(plan, 0)} found."

        answer = f"Found {total} {describe(plan, total)}."
        if total > len(result.tickets):
            answer += f" Showing the {len(result.tickets)} most recent."
        return answer

    @staticmethod
    def facts(plan: QueryPlan, result: PlanResult) -> dict:
        """Everything the reply may be based on: totals, groups and fetched tickets."""
        return {
            "intent": plan.intent.value,
            "matching": describe(plan, result.total),
            "total": result.total,
            "stats": result.stats,
            "tickets": [
                {
                    "id": t.id,
                    "title": t.title,
                    "summary": t.ai_summary,
                    "status": t.status.value,
                    "priority": t.priority.value,
                    "category": t.category.value,
                }
                for t in result.tickets
            ],
        }

    async def build_answer(self, question: str, plan: QueryPlan, result: PlanResult) -> str:
        """Conversational reply from the LLM, grounded in the results; template as fallback."""
        reply = await self.llm.compose_answer(question, self.facts(plan, result))
        grounded = grounded_reply(reply, plan, result)
        if grounded:
            return grounded

        fallback = self.template_answer(plan, result)
        if plan.intent is AssistantIntent.SUMMARIZE and result.total:
            fallback += f" {AssistantMessages.SUMMARY_UNAVAILABLE}"
        return fallback
