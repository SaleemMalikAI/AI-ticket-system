"""One place that talks to the OpenAI-compatible chat API (Groq by default).

Never raises: any network, HTTP or response-shape failure is logged and
returned as None, so callers can degrade gracefully.
"""

import logging
from typing import Any

import httpx

from app.constants.ai import LLM_CHAT_COMPLETIONS_PATH, LLM_RESPONSE_FORMAT, LLM_TEMPERATURE
from app.core.config import Settings

logger = logging.getLogger(__name__)


async def chat_completion(
    settings: Settings,
    messages: list[dict[str, str]],
    *,
    json_mode: bool = True,
    temperature: float = LLM_TEMPERATURE,
) -> str | None:
    """Returns the assistant message text, or None if the LLM is unavailable."""
    if not settings.llm_api_key:
        logger.warning("LLM_API_KEY not set; skipping AI call")
        return None

    payload: dict[str, Any] = {
        "model": settings.llm_model,
        "temperature": temperature,
        "messages": messages,
    }
    if json_mode:
        payload["response_format"] = LLM_RESPONSE_FORMAT

    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            resp = await client.post(
                f"{settings.llm_base_url}{LLM_CHAT_COMPLETIONS_PATH}",
                headers={"Authorization": f"Bearer {settings.llm_api_key}"},
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
        logger.error("AI request failed: %s", exc)
        return None
