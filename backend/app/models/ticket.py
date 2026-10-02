from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.constants.ticket import DEFAULT_STATUS, TITLE_MAX_LENGTH, Category, Priority, Status
from app.database.base import Base
from app.database.types import string_enum


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(TITLE_MAX_LENGTH))
    description: Mapped[str] = mapped_column(Text)

    # Final values (what the user chose, or the AI suggestion if they didn't)
    category: Mapped[Category] = mapped_column(string_enum(Category, "category"), index=True)
    priority: Mapped[Priority] = mapped_column(string_enum(Priority, "priority"), index=True)
    status: Mapped[Status] = mapped_column(
        string_enum(Status, "status"), default=DEFAULT_STATUS, index=True
    )

    # Raw AI output, kept separately so overrides are visible
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_category: Mapped[Category | None] = mapped_column(
        string_enum(Category, "ai_category"), nullable=True
    )
    ai_priority: Mapped[Priority | None] = mapped_column(
        string_enum(Priority, "ai_priority"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
