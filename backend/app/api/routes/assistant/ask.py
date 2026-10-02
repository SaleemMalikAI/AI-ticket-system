from fastapi import APIRouter

from app.api.dependencies import AssistantServiceDep
from app.constants.api_routes import AssistantPaths
from app.schemas.assistant import AskRequest, AskResponse

router = APIRouter()


@router.post(AssistantPaths.ASK, response_model=AskResponse)
async def ask(data: AskRequest, service: AssistantServiceDep) -> AskResponse:
    """Answer a question about tickets. 200 with a hint if it can't be planned; 503 if AI is down."""
    return await service.ask(data.question)
