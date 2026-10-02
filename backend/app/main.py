"""Application entry point: `uvicorn app.main:app`."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging_config import setup_logging
from app.database.connection import engine
from app.exceptions.handlers import register_exception_handlers
from app.middleware import register_middleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    await engine.dispose()  # close pooled DB connections on shutdown


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging(settings.log_level)

    app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)
    register_middleware(app, settings)
    register_exception_handlers(app)
    app.include_router(api_router)
    return app


app = create_app()
