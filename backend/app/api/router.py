"""Root router: every route module is registered here."""

from fastapi import APIRouter

from app.api.routes import assistant, health, tickets

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(tickets.router)
api_router.include_router(assistant.router)
