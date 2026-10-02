from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants.assistant import (
    PLAN_LIMIT_DEFAULT,
    PLAN_LIMIT_MAX,
    QUESTION_MAX_LENGTH,
    QUESTION_MIN_LENGTH,
    AssistantIntent,
    DateRange,
    GroupBy,
)
from app.constants.ticket import (
    DESCRIPTION_MAX_LENGTH,
    DESCRIPTION_MIN_LENGTH,
    SEARCH_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    TITLE_MIN_LENGTH,
    Category,
    Priority,
    Status,
)
from app.schemas.ticket import TicketRead
from app.utilities.text import normalize_choice, strip_not_blank

# Ways an LLM might say "no filter"
_EMPTY_VALUES = {"", "null", "none", "any", "all", "n/a"}


class QueryPlan(BaseModel):
    """What the LLM is allowed to ask for. Anything else fails validation."""

    model_config = ConfigDict(extra="ignore")

    intent: AssistantIntent
    status: Status | None = None
    category: Category | None = None
    priority: Priority | None = None
    q: str | None = Field(None, max_length=SEARCH_MAX_LENGTH)
    date_range: DateRange | None = None
    group_by: GroupBy | None = None
    limit: int = Field(PLAN_LIMIT_DEFAULT, ge=1, le=PLAN_LIMIT_MAX)

    @field_validator("intent", "status", "category", "priority", "date_range", "group_by", mode="before")
    @classmethod
    def normalize_choice_fields(cls, v: Any) -> Any:
        # be lenient with casing / spaces: "In Progress" -> "in_progress"
        if isinstance(v, str):
            v = normalize_choice(v)
            return None if v in _EMPTY_VALUES else v
        return v

    @field_validator("q", mode="before")
    @classmethod
    def blank_q_to_none(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip()
            return None if v.lower() in _EMPTY_VALUES else v
        return v

    @field_validator("limit", mode="before")
    @classmethod
    def clamp_limit(cls, v: Any) -> Any:
        # "show me 50 tickets" should still work: clamp instead of rejecting the plan
        if v is None:
            return PLAN_LIMIT_DEFAULT
        if isinstance(v, int) and not isinstance(v, bool):
            return min(max(v, 1), PLAN_LIMIT_MAX)
        return v


class TicketDraft(BaseModel):
    """A ticket the AI proposes from a chat message. Nothing is saved until the user
    confirms it, which goes through the normal POST /api/tickets endpoint."""

    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=TITLE_MIN_LENGTH, max_length=TITLE_MAX_LENGTH)
    description: str = Field(min_length=DESCRIPTION_MIN_LENGTH, max_length=DESCRIPTION_MAX_LENGTH)
    category: Category
    priority: Priority

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, v: Any) -> Any:
        return v.strip() if isinstance(v, str) else v

    @field_validator("category", "priority", mode="before")
    @classmethod
    def normalize_choice_fields(cls, v: Any) -> Any:
        return normalize_choice(v) if isinstance(v, str) else v


class AskRequest(BaseModel):
    question: str = Field(min_length=QUESTION_MIN_LENGTH, max_length=QUESTION_MAX_LENGTH)

    @field_validator("question")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return strip_not_blank(v)


class AskResponse(BaseModel):
    answer: str
    plan: QueryPlan | None = None  # None when the question could not be turned into a plan
    tickets: list[TicketRead] = []
    stats: dict[str, int] | None = None  # {"open": 3, ...} for intent "stats"
    draft: TicketDraft | None = None  # intent "create": a ticket for the user to confirm
