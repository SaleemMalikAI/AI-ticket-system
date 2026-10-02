from fastapi import APIRouter, status

from app.api.dependencies import TicketServiceDep
from app.constants.api_routes import TicketPaths
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate, TicketRead

router = APIRouter()


@router.post(TicketPaths.COLLECTION, response_model=TicketRead, status_code=status.HTTP_201_CREATED)
async def create_ticket(data: TicketCreate, service: TicketServiceDep) -> Ticket:
    """Create a ticket; AI fills summary and any category/priority the user left empty."""
    return await service.create(data)
