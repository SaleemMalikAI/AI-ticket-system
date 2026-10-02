"""All /api/assistant endpoints, one file per endpoint."""

from fastapi import APIRouter

from app.api.routes.assistant import ask
from app.constants.api_routes import ApiRoutes, ApiTags

router = APIRouter()
router.include_router(ask.router, prefix=ApiRoutes.ASSISTANT, tags=[ApiTags.ASSISTANT])
