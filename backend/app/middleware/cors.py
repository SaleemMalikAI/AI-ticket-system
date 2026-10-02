from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import Settings


def add_cors(app: FastAPI, settings: Settings) -> None:
    """Allow the frontend origin(s) from CORS_ORIGINS to call the API from the browser."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["*"],
        allow_headers=["*"],
    )
