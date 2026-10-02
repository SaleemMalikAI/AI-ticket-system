"""Database access for tickets. Only SQL lives here; no business rules."""

from collections.abc import Sequence
from datetime import datetime
from typing import Any

from sqlalchemy import ColumnElement, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.ticket import Category, Priority, Status
from app.models.ticket import Ticket

# Columns the assistant may group by (whitelist: never build SQL from user text)
GROUPABLE_COLUMNS = {
    "status": Ticket.status,
    "category": Ticket.category,
    "priority": Ticket.priority,
}


def _escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def build_filters(
    *,
    status: Status | None = None,
    category: Category | None = None,
    priority: Priority | None = None,
    q: str | None = None,
    created_after: datetime | None = None,
) -> list[ColumnElement[bool]]:
    filters: list[ColumnElement[bool]] = []
    if status:
        filters.append(Ticket.status == status)
    if category:
        filters.append(Ticket.category == category)
    if priority:
        filters.append(Ticket.priority == priority)
    if q:
        pattern = f"%{_escape_like(q)}%"
        filters.append(
            or_(
                Ticket.title.ilike(pattern, escape="\\"),
                Ticket.description.ilike(pattern, escape="\\"),
                Ticket.ai_summary.ilike(pattern, escape="\\"),
            )
        )
    if created_after:
        filters.append(Ticket.created_at >= created_after)
    return filters


class TicketRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, ticket: Ticket) -> Ticket:
        self.session.add(ticket)
        await self.session.commit()
        await self.session.refresh(ticket)
        return ticket

    async def get(self, ticket_id: int) -> Ticket | None:
        return await self.session.get(Ticket, ticket_id)

    async def list(
        self,
        *,
        status: Status | None = None,
        category: Category | None = None,
        priority: Priority | None = None,
        q: str | None = None,
        created_after: datetime | None = None,
        limit: int,
        offset: int = 0,
    ) -> tuple[list[Ticket], int]:
        filters = build_filters(
            status=status, category=category, priority=priority, q=q, created_after=created_after
        )

        total = await self.session.scalar(select(func.count()).select_from(Ticket).where(*filters))
        result = await self.session.scalars(
            select(Ticket)
            .where(*filters)
            .order_by(Ticket.created_at.desc(), Ticket.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result), total or 0

    async def count(self, filters: Sequence[ColumnElement[bool]]) -> int:
        return await self.session.scalar(select(func.count()).select_from(Ticket).where(*filters)) or 0

    async def count_by(
        self, group_by: str, filters: Sequence[ColumnElement[bool]]
    ) -> dict[str, int]:
        """{"open": 3, "closed": 1} for the given column, largest group first."""
        column = GROUPABLE_COLUMNS[group_by]
        rows = await self.session.execute(
            select(column, func.count())
            .where(*filters)
            .group_by(column)
            .order_by(func.count().desc())
        )
        return {value.value: count for value, count in rows.all()}

    async def update(self, ticket: Ticket, values: dict[str, Any]) -> Ticket:
        for field, value in values.items():
            setattr(ticket, field, value)
        await self.session.commit()
        await self.session.refresh(ticket)
        return ticket

    async def delete(self, ticket: Ticket) -> None:
        await self.session.delete(ticket)
        await self.session.commit()
