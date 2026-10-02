"""Ticket business rules. Routes call this; it calls the repository and the AI."""

import logging

from app.constants.messages import ErrorMessages
from app.constants.ticket import DEFAULT_CATEGORY, DEFAULT_PRIORITY, DEFAULT_STATUS
from app.exceptions.errors import NotFoundError
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository
from app.schemas.ticket import TicketCreate, TicketListParams, TicketUpdate
from app.services.ai_service import TicketAnalyzer

logger = logging.getLogger(__name__)


class TicketService:
    def __init__(self, repository: TicketRepository, analyzer: TicketAnalyzer):
        self.repository = repository
        self.analyzer = analyzer

    async def create(self, data: TicketCreate) -> Ticket:
        ai = await self.analyzer.analyze(data.title, data.description)

        # Precedence: explicit user value > AI suggestion > default
        ticket = Ticket(
            title=data.title,
            description=data.description,
            category=data.category or (ai.category if ai else DEFAULT_CATEGORY),
            priority=data.priority or (ai.priority if ai else DEFAULT_PRIORITY),
            status=DEFAULT_STATUS,
            ai_summary=ai.summary if ai else None,
            ai_category=ai.category if ai else None,
            ai_priority=ai.priority if ai else None,
        )
        ticket = await self.repository.add(ticket)
        logger.info("Created ticket id=%s ai=%s", ticket.id, ai is not None)
        return ticket

    async def list(self, params: TicketListParams) -> tuple[list[Ticket], int]:
        return await self.repository.list(**params.model_dump())

    async def get(self, ticket_id: int) -> Ticket:
        ticket = await self.repository.get(ticket_id)
        if ticket is None:
            raise NotFoundError(ErrorMessages.TICKET_NOT_FOUND.format(ticket_id=ticket_id))
        return ticket

    async def update(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        """Update status, and/or override category/priority."""
        ticket = await self.get(ticket_id)
        ticket = await self.repository.update(ticket, data.model_dump(exclude_none=True))
        logger.info(
            "Updated ticket id=%s fields=%s", ticket_id, data.model_dump(exclude_none=True, mode="json")
        )
        return ticket

    async def delete(self, ticket_id: int) -> None:
        ticket = await self.get(ticket_id)
        await self.repository.delete(ticket)
        logger.info("Deleted ticket id=%s", ticket_id)
