"""Test setup.

Uses TEST_DATABASE_URL if set (e.g. a Postgres test DB in CI/Docker),
otherwise an in-memory SQLite DB so tests run with zero setup.
The LLM is replaced with a fake so tests are fast and deterministic.
"""

import json
import os

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_analyzer, get_assistant_llm
from app.constants import Category, Priority
from app.database import Base, get_session
from app.main import app
from app.schemas import AISuggestion

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite+aiosqlite:///:memory:")


class FakeAnalyzer:
    """Stands in for the LLM. Set `.result` to control what it returns."""

    def __init__(self):
        self.result: AISuggestion | None = AISuggestion(
            summary="User cannot log in after password reset.",
            category=Category.ACCOUNT,
            priority=Priority.HIGH,
        )
        self.calls = 0

    async def analyze(self, title: str, description: str) -> AISuggestion | None:
        self.calls += 1
        return self.result


class FakeAssistantLLM:
    """Stands in for the assistant's planner + answer writer.

    `plan` is what plan_query returns: a dict (sent as JSON), a raw string,
    or None (= LLM unavailable). `reply` is what compose_answer returns;
    None makes the service fall back to its templated answer. `draft` is what
    draft_ticket returns (dict sent as JSON, raw string, or None).
    """

    def __init__(self):
        self.plan: dict | str | None = {"intent": "list"}
        self.reply: str | None = None
        self.draft: dict | str | None = None
        self.questions: list[str] = []
        self.facts: dict | None = None

    async def plan_query(self, question: str) -> str | None:
        self.questions.append(question)
        return json.dumps(self.plan) if isinstance(self.plan, dict) else self.plan

    async def compose_answer(self, question: str, facts: dict) -> str | None:
        self.facts = facts
        return self.reply

    async def draft_ticket(self, question: str) -> str | None:
        return json.dumps(self.draft) if isinstance(self.draft, dict) else self.draft


@pytest.fixture
def ticket_payload() -> dict[str, str]:
    return {
        "title": "Cannot log in",
        "description": "After resetting my password I get 'invalid credentials' every time.",
    }


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
def fake_assistant() -> FakeAssistantLLM:
    return FakeAssistantLLM()


@pytest.fixture
async def client(engine, fake_ai, fake_assistant):
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_analyzer] = lambda: fake_ai
    app.dependency_overrides[get_assistant_llm] = lambda: fake_assistant

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()
