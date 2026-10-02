from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.constants.messages import ErrorMessages
from app.constants.ticket import (
    DESCRIPTION_MAX_LENGTH,
    DESCRIPTION_MIN_LENGTH,
    LIST_DEFAULT_LIMIT,
    LIST_MAX_LIMIT,
    SEARCH_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    TITLE_MIN_LENGTH,
    Category,
    Priority,
    Status,
)
from app.utilities.text import strip_not_blank


class TicketCreate(BaseModel):
    title: str = Field(min_length=TITLE_MIN_LENGTH, max_length=TITLE_MAX_LENGTH)
    description: str = Field(min_length=DESCRIPTION_MIN_LENGTH, max_length=DESCRIPTION_MAX_LENGTH)
    # Optional: if omitted, the AI suggestion is used (user override otherwise)
    category: Category | None = None
    priority: Priority | None = None

    @field_validator("title", "description")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return strip_not_blank(v)


class TicketUpdate(BaseModel):
    status: Status | None = None
    category: Category | None = None
    priority: Priority | None = None

    @model_validator(mode="after")
    def at_least_one_field(self) -> "TicketUpdate":
        if self.status is None and self.category is None and self.priority is None:
            raise ValueError(ErrorMessages.EMPTY_UPDATE)
        return self


class TicketListParams(BaseModel):
    """Query string of GET /api/tickets."""

    status: Status | None = None
    category: Category | None = None
    priority: Priority | None = None
    q: str | None = Field(None, max_length=SEARCH_MAX_LENGTH, description="Text search")
    limit: int = Field(LIST_DEFAULT_LIMIT, ge=1, le=LIST_MAX_LIMIT)
    offset: int = Field(0, ge=0)

    @field_validator("q")
    @classmethod
    def blank_to_none(cls, v: str | None) -> str | None:
        return (v.strip() or None) if v else None


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: Category
    priority: Priority
    status: Status
    ai_summary: str | None
    ai_category: Category | None
    ai_priority: Priority | None
    created_at: datetime
    updated_at: datetime


class TicketList(BaseModel):
    items: list[TicketRead]
    total: int
