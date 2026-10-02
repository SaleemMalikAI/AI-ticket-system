from fastapi import APIRouter

from app.api.dependencies import TicketServiceDep
from app.constants.api_routes import TicketPaths
from app.models.ticket import Ticket
from app.schemas.ticket import TicketRead, TicketUpdate

router = APIRouter()


@router.patch(TicketPaths.BY_ID, response_model=TicketRead)
async def update_ticket(ticket_id: int, data: TicketUpdate, service: TicketServiceDep) -> Ticket:
    """Update status, and/or override category/priority."""
    return await service.update(ticket_id, data)
