from fastapi import APIRouter

from app.api.dependencies import HealthServiceDep
from app.constants.api_routes import ApiRoutes, ApiTags
from app.schemas.health import HealthResponse

router = APIRouter(tags=[ApiTags.HEALTH])


@router.get(ApiRoutes.HEALTH, response_model=HealthResponse)
async def health(service: HealthServiceDep) -> HealthResponse:
    await service.check_database()
    return HealthResponse()
