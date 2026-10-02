from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models import Category, Priority, Status


class TicketCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    # Optional: if omitted, the AI suggestion is used (user override otherwise)
    category: Category | None = None
    priority: Priority | None = None

    @field_validator("title", "description")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v


class TicketUpdate(BaseModel):
    status: Status | None = None
    category: Category | None = None
    priority: Priority | None = None

    @model_validator(mode="after")
    def at_least_one_field(self) -> "TicketUpdate":
        if self.status is None and self.category is None and self.priority is None:
            raise ValueError("provide at least one of: status, category, priority")
        return self


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


class AISuggestion(BaseModel):
    """Validated shape of the LLM response."""

    summary: str = Field(min_length=1, max_length=500)
    category: Category
    priority: Priority
