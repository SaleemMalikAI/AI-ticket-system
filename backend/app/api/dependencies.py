"""FastAPI dependency providers. Tests override get_session, get_analyzer and get_assistant_llm."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.database.connection import get_session
from app.repositories.ticket_repository import TicketRepository
from app.services.ai_service import LLMTicketAnalyzer, TicketAnalyzer
from app.services.assistant_service import AssistantLLM, AssistantService, GroqAssistantLLM
from app.services.health_service import HealthService
from app.services.ticket_service import TicketService

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_analyzer() -> TicketAnalyzer:
    return LLMTicketAnalyzer(get_settings())


AnalyzerDep = Annotated[TicketAnalyzer, Depends(get_analyzer)]


def get_assistant_llm() -> AssistantLLM:
    return GroqAssistantLLM(get_settings())


AssistantLLMDep = Annotated[AssistantLLM, Depends(get_assistant_llm)]


def get_ticket_service(session: SessionDep, analyzer: AnalyzerDep) -> TicketService:
    return TicketService(TicketRepository(session), analyzer)


def get_health_service(session: SessionDep) -> HealthService:
    return HealthService(session)


def get_assistant_service(session: SessionDep, llm: AssistantLLMDep) -> AssistantService:
    return AssistantService(TicketRepository(session), llm)


TicketServiceDep = Annotated[TicketService, Depends(get_ticket_service)]
HealthServiceDep = Annotated[HealthService, Depends(get_health_service)]
AssistantServiceDep = Annotated[AssistantService, Depends(get_assistant_service)]
