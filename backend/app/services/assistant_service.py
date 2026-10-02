"""Ask AI: answer natural-language questions about tickets.

Flow: question -> LLM returns a JSON QueryPlan -> Pydantic validates it ->
the backend runs it with the ticket repository -> templated answer.
The LLM never writes SQL; for "summarize" it only sees the fetched tickets'
id / title / AI summary, and every #id it cites must be one of them.
"""

import json
import logging
import re
from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Protocol

from pydantic import ValidationError

from app.constants.assistant import (
    DEFAULT_GROUP_BY,
    PLANNER_SYSTEM_PROMPT,
    SUMMARIZER_SYSTEM_PROMPT,
    AssistantIntent,
    AssistantMessages,
    DateRange,
)
from app.constants.messages import ErrorMessages
from app.core.config import Settings
from app.exceptions.errors import AIUnavailableError
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository, build_filters
from app.schemas.assistant import AskResponse, QueryPlan
from app.schemas.ticket import TicketRead
from app.services.llm_client import chat_completion
from app.utilities.dates import date_range_start
from app.utilities.text import label

logger = logging.getLogger(__name__)

_CITATION = re.compile(r"#(\d+)")
_DATE_PHRASES = {
    DateRange.TODAY: "from today",
    DateRange.LAST_7_DAYS: "from the last 7 days",
    DateRange.LAST_30_DAYS: "from the last 30 days",
}


class AssistantLLM(Protocol):
    """The two LLM calls the assistant makes. Both return None on any failure."""

    async def plan_query(self, question: str) -> str | None: ...

    async def summarize(self, question: str, tickets: Sequence[Ticket]) -> str | None: ...


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

    async def summarize(self, question: str, tickets: Sequence[Ticket]) -> str | None:
        # Grounding: the model sees ONLY these fields of the fetched tickets
        facts = [{"id": t.id, "title": t.title, "summary": t.ai_summary} for t in tickets]
        return await chat_completion(
            self.settings,
            [
                {"role": "system", "content": SUMMARIZER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"<tickets>{json.dumps(facts)}</tickets>\n{wrap_question(question)}",
                },
            ],
            json_mode=False,
        )


def parse_plan(raw: str) -> QueryPlan | None:
    """Validate the planner's JSON. Returns None if it is not a usable plan."""
    try:
        return QueryPlan.model_validate_json(raw)
    except ValidationError as exc:
        logger.warning("Assistant returned an invalid plan: %s", exc.errors(include_url=False))
        return None


def grounded_summary(text: str | None, tickets: Sequence[Ticket]) -> str | None:
    """Accept a summary only if it cites at least one ticket and only fetched ones."""
    if not text or not text.strip():
        return None
    cited = {int(n) for n in _CITATION.findall(text)}
    allowed = {t.id for t in tickets}
    if not cited or not cited <= allowed:
        logger.warning("Rejected ungrounded summary: cited=%s allowed=%s", cited, allowed)
        return None
    return text.strip()


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

        result = await self.execute_plan(plan)
        answer = await self.build_answer(question, plan, result)
        logger.info("Assistant answered intent=%s total=%s", plan.intent.value, result.total)
        return AskResponse(
            answer=answer,
            plan=plan,
            tickets=[TicketRead.model_validate(t) for t in result.tickets],
            stats=result.stats,
        )

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

    async def build_answer(self, question: str, plan: QueryPlan, result: PlanResult) -> str:
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

        list_answer = f"Found {total} {describe(plan, total)}."
        if total > len(result.tickets):
            list_answer += f" Showing the {len(result.tickets)} most recent."

        if plan.intent is AssistantIntent.SUMMARIZE:
            summary = grounded_summary(
                await self.llm.summarize(question, result.tickets), result.tickets
            )
            return summary or f"{list_answer} {AssistantMessages.SUMMARY_UNAVAILABLE}"

        return list_answer
