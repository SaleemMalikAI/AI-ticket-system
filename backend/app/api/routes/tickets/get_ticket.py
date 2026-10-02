from fastapi import APIRouter

from app.api.dependencies import TicketServiceDep
from app.constants.api_routes import TicketPaths
from app.models.ticket import Ticket
from app.schemas.ticket import TicketRead

router = APIRouter()


@router.get(TicketPaths.BY_ID, response_model=TicketRead)
async def get_ticket(ticket_id: int, service: TicketServiceDep) -> Ticket:
    return await service.get(ticket_id)
