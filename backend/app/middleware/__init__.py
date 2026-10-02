from fastapi import FastAPI

from app.core.config import Settings
from app.middleware.cors import add_cors
from app.middleware.request_logging import RequestLoggingMiddleware


def register_middleware(app: FastAPI, settings: Settings) -> None:
    # The last one added runs first, so request logging wraps CORS
    add_cors(app, settings)
    app.add_middleware(RequestLoggingMiddleware)


__all__ = ["register_middleware"]
