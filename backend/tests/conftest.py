"""Test setup.

Uses TEST_DATABASE_URL if set (e.g. a Postgres test DB in CI/Docker),
otherwise an in-memory SQLite DB so tests run with zero setup.
The LLM is replaced with a fake so tests are fast and deterministic.
"""

import os

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database import Base, get_session
from app.main import app
from app.models import Category, Priority
from app.schemas import AISuggestion
from app.services.ai import get_analyzer

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite+aiosqlite:///:memory:")


class FakeAnalyzer:
    """Stands in for the LLM. Set `.result` to control what it returns."""

    def __init__(self):
        self.result: AISuggestion | None = AISuggestion(
            summary="User cannot log in after password reset.",
            category=Category.account,
            priority=Priority.high,
        )
        self.calls = 0

    async def analyze(self, title: str, description: str) -> AISuggestion | None:
        self.calls += 1
        return self.result


@pytest.fixture
async def engine():
    kwargs = {"poolclass": StaticPool} if TEST_DATABASE_URL.startswith("sqlite") else {}
    eng = create_async_engine(TEST_DATABASE_URL, **kwargs)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest.fixture
def fake_ai() -> FakeAnalyzer:
    return FakeAnalyzer()


@pytest.fixture
async def client(engine, fake_ai):
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_analyzer] = lambda: fake_ai

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()
