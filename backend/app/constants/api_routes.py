"""Every URL the API serves. Keep in sync with frontend/src/constants/api-routes.ts."""

from enum import StrEnum


class ApiRoutes(StrEnum):
    HEALTH = "/health"
    TICKETS = "/api/tickets"
    ASSISTANT = "/api/assistant"


class TicketPaths(StrEnum):
    """Paths below ApiRoutes.TICKETS."""

    COLLECTION = ""
    BY_ID = "/{ticket_id}"


class AssistantPaths(StrEnum):
    """Paths below ApiRoutes.ASSISTANT."""

    ASK = "/ask"


class ApiTags(StrEnum):
    """OpenAPI (/docs) groups."""

    HEALTH = "health"
    TICKETS = "tickets"
    ASSISTANT = "assistant"
