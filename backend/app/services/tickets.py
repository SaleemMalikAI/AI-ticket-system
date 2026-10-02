"""Data-access functions for tickets. Routers stay thin; DB logic lives here."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Category, Priority, Status, Ticket
from app.schemas import AISuggestion, TicketCreate, TicketUpdate

DEFAULT_CATEGORY = Category.general
DEFAULT_PRIORITY = Priority.medium


async def create_ticket(
    session: AsyncSession, data: TicketCreate, ai: AISuggestion | None
) -> Ticket:
    # Precedence: explicit user value > AI suggestion > default
    ticket = Ticket(
        title=data.title,
        description=data.description,
        category=data.category or (ai.category if ai else DEFAULT_CATEGORY),
        priority=data.priority or (ai.priority if ai else DEFAULT_PRIORITY),
        status=Status.open,
        ai_summary=ai.summary if ai else None,
        ai_category=ai.category if ai else None,
        ai_priority=ai.priority if ai else None,
    )
    session.add(ticket)
    await session.commit()
    await session.refresh(ticket)
    return ticket


async def list_tickets(
    session: AsyncSession,
    *,
    status: Status | None = None,
    category: Category | None = None,
    priority: Priority | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Ticket], int]:
    filters = []
    if status:
        filters.append(Ticket.status == status)
    if category:
        filters.append(Ticket.category == category)
    if priority:
        filters.append(Ticket.priority == priority)

    total = await session.scalar(select(func.count()).select_from(Ticket).where(*filters))
    result = await session.scalars(
        select(Ticket)
        .where(*filters)
        .order_by(Ticket.created_at.desc(), Ticket.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result), total or 0


async def get_ticket(session: AsyncSession, ticket_id: int) -> Ticket | None:
    return await session.get(Ticket, ticket_id)


async def update_ticket(session: AsyncSession, ticket: Ticket, data: TicketUpdate) -> Ticket:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(ticket, field, value)
    await session.commit()
    await session.refresh(ticket)
    return ticket


async def delete_ticket(session: AsyncSession, ticket: Ticket) -> None:
    await session.delete(ticket)
    await session.commit()
