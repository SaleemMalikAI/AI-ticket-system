from typing import Annotated

from fastapi import APIRouter, Query

from app.api.dependencies import TicketServiceDep
from app.constants.api_routes import TicketPaths
from app.schemas.ticket import TicketList, TicketListParams

router = APIRouter()


@router.get(TicketPaths.COLLECTION, response_model=TicketList)
async def list_tickets(
    params: Annotated[TicketListParams, Query()], service: TicketServiceDep
) -> TicketList:
    """Newest first; filter by status, category and priority."""
    items, total = await service.list(params)
    return TicketList.model_validate({"items": items, "total": total}, from_attributes=True)
