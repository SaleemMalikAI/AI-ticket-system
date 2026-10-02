"""All /api/tickets endpoints, one file per endpoint."""

from fastapi import APIRouter

from app.api.routes.tickets import (
    create_ticket,
    delete_ticket,
    get_ticket,
    list_tickets,
    update_ticket,
)
from app.constants.api_routes import ApiRoutes, ApiTags

router = APIRouter()

for endpoint in (list_tickets, create_ticket, get_ticket, update_ticket, delete_ticket):
    router.include_router(endpoint.router, prefix=ApiRoutes.TICKETS, tags=[ApiTags.TICKETS])
