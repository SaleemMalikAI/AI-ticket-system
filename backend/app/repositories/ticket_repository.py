"""Database access for tickets. Only SQL lives here; no business rules."""

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.ticket import Category, Priority, Status
from app.models.ticket import Ticket


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
        status: Status | None,
        category: Category | None,
        priority: Priority | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Ticket], int]:
        filters = []
        if status:
            filters.append(Ticket.status == status)
        if category:
            filters.append(Ticket.category == category)
        if priority:
            filters.append(Ticket.priority == priority)

        total = await self.session.scalar(select(func.count()).select_from(Ticket).where(*filters))
        result = await self.session.scalars(
            select(Ticket)
            .where(*filters)
            .order_by(Ticket.created_at.desc(), Ticket.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result), total or 0

    async def update(self, ticket: Ticket, values: dict[str, Any]) -> Ticket:
        for field, value in values.items():
            setattr(ticket, field, value)
        await self.session.commit()
        await self.session.refresh(ticket)
        return ticket

    async def delete(self, ticket: Ticket) -> None:
        await self.session.delete(ticket)
        await self.session.commit()
