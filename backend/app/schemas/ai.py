from pydantic import BaseModel, Field

from app.constants.ai import AI_SUMMARY_MAX_LENGTH
from app.constants.ticket import Category, Priority


class AISuggestion(BaseModel):
    """Validated shape of the LLM response."""

    summary: str = Field(min_length=1, max_length=AI_SUMMARY_MAX_LENGTH)
    category: Category
    priority: Priority
