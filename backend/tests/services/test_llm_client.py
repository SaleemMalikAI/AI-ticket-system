import json

import httpx
import pytest

from app.core.config import Settings
from app.services import llm_client
from app.services.llm_client import chat_completion

MESSAGES = [{"role": "user", "content": "hi"}]


@pytest.fixture
def settings() -> Settings:
    return Settings(llm_api_key="test-key", llm_base_url="https://llm.test/v1", llm_model="m")


def use_transport(monkeypatch, handler):
    """Route the client's HTTP calls to `handler` instead of the network."""
    real_client = httpx.AsyncClient
    monkeypatch.setattr(
        llm_client.httpx,
        "AsyncClient",
        lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw),
    )


async def test_returns_none_without_api_key():
    assert await chat_completion(Settings(llm_api_key=""), MESSAGES) is None


async def test_returns_content_and_sends_json_mode(monkeypatch, settings):
    sent = {}

    def handler(request: httpx.Request) -> httpx.Response:
        sent.update(json.loads(request.content))
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"ok": true}'}}]})

    use_transport(monkeypatch, handler)

    assert await chat_completion(settings, MESSAGES) == '{"ok": true}'
    assert sent["model"] == "m"
    assert sent["response_format"] == {"type": "json_object"}


@pytest.mark.parametrize(
    "response",
    [
        httpx.Response(404, json={"error": "model_not_found"}),
        httpx.Response(200, json={"unexpected": "shape"}),
        httpx.Response(200, text="not json"),
    ],
)
async def test_failures_return_none(monkeypatch, settings, response):
    use_transport(monkeypatch, lambda request: response)
    assert await chat_completion(settings, MESSAGES) is None
