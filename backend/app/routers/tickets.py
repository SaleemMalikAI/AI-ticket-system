import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Category, Priority, Status, Ticket
from app.schemas import TicketCreate, TicketList, TicketRead, TicketUpdate
from app.services import tickets as svc
from app.services.ai import TicketAnalyzer, get_analyzer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tickets", tags=["tickets"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
AnalyzerDep = Annotated[TicketAnalyzer, Depends(get_analyzer)]


async def get_ticket_or_404(ticket_id: int, session: SessionDep) -> Ticket:
    ticket = await svc.get_ticket(session, ticket_id)
    if ticket is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Ticket {ticket_id} not found")
    return ticket


TicketDep = Annotated[Ticket, Depends(get_ticket_or_404)]


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
async def create_ticket(data: TicketCreate, session: SessionDep, analyzer: AnalyzerDep):
    suggestion = await analyzer.analyze(data.title, data.description)
    ticket = await svc.create_ticket(session, data, suggestion)
    logger.info("Created ticket id=%s ai=%s", ticket.id, suggestion is not None)
    return ticket


@router.get("", response_model=TicketList)
async def list_tickets(
    session: SessionDep,
    status_: Annotated[Status | None, Query(alias="status")] = None,
    category: Category | None = None,
    priority: Priority | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    items, total = await svc.list_tickets(
        session, status=status_, category=category, priority=priority, limit=limit, offset=offset
    )
    return TicketList(items=items, total=total)


@router.get("/{ticket_id}", response_model=TicketRead)
async def get_ticket(ticket: TicketDep):
    return ticket


@router.patch("/{ticket_id}", response_model=TicketRead)
async def update_ticket(data: TicketUpdate, ticket: TicketDep, session: SessionDep):
    """Update status, and/or override category/priority."""
    updated = await svc.update_ticket(session, ticket, data)
    logger.info("Updated ticket id=%s fields=%s", ticket.id, data.model_dump(exclude_none=True, mode="json"))
    return updated


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket: TicketDep, session: SessionDep):
    await svc.delete_ticket(session, ticket)
    logger.info("Deleted ticket id=%s", ticket.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
