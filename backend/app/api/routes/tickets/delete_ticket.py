from fastapi import APIRouter, Response, status

from app.api.dependencies import TicketServiceDep
from app.constants.api_routes import TicketPaths

router = APIRouter()


@router.delete(TicketPaths.BY_ID, status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: int, service: TicketServiceDep) -> Response:
    await service.delete(ticket_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
