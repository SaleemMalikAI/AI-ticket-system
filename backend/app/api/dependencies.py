"""FastAPI dependency providers. Tests override get_session and get_analyzer."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.database.connection import get_session
from app.repositories.ticket_repository import TicketRepository
from app.services.ai_service import LLMTicketAnalyzer, TicketAnalyzer
from app.services.health_service import HealthService
from app.services.ticket_service import TicketService

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_analyzer() -> TicketAnalyzer:
    return LLMTicketAnalyzer(get_settings())


AnalyzerDep = Annotated[TicketAnalyzer, Depends(get_analyzer)]


def get_ticket_service(session: SessionDep, analyzer: AnalyzerDep) -> TicketService:
    return TicketService(TicketRepository(session), analyzer)


def get_health_service(session: SessionDep) -> HealthService:
    return HealthService(session)


TicketServiceDep = Annotated[TicketService, Depends(get_ticket_service)]
HealthServiceDep = Annotated[HealthService, Depends(get_health_service)]
