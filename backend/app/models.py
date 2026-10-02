from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SAEnum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Category(str, Enum):
    billing = "billing"
    technical = "technical"
    account = "account"
    feature_request = "feature_request"
    general = "general"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class Status(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


def _enum(enum_cls: type[Enum], name: str) -> SAEnum:
    # Stored as VARCHAR + CHECK constraint (not a native PG enum) so adding
    # new values later is a simple migration.
    return SAEnum(
        enum_cls,
        name=name,
        native_enum=False,
        create_constraint=True,
        length=32,
        values_callable=lambda e: [m.value for m in e],
    )


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)

    # Final values (what the user chose, or the AI suggestion if they didn't)
    category: Mapped[Category] = mapped_column(_enum(Category, "category"), index=True)
    priority: Mapped[Priority] = mapped_column(_enum(Priority, "priority"), index=True)
    status: Mapped[Status] = mapped_column(
        _enum(Status, "status"), default=Status.open, index=True
    )

    # Raw AI output, kept separately so overrides are visible
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_category: Mapped[Category | None] = mapped_column(
        _enum(Category, "ai_category"), nullable=True
    )
    ai_priority: Mapped[Priority | None] = mapped_column(
        _enum(Priority, "ai_priority"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
