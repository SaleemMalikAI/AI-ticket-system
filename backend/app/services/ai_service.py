"""AI triage: summary + suggested category + suggested priority.

Uses any OpenAI-compatible chat completions API (Groq by default).
Never raises to the caller: on any failure it logs and returns None, so
ticket creation keeps working when the LLM is down or misconfigured.
"""

import json
import logging
from typing import Protocol

import httpx
from pydantic import ValidationError

from app.constants.ai import (
    LLM_CHAT_COMPLETIONS_PATH,
    LLM_RESPONSE_FORMAT,
    LLM_TEMPERATURE,
    SYSTEM_PROMPT,
)
from app.core.config import Settings
from app.schemas.ai import AISuggestion
from app.utilities.text import normalize_choice

logger = logging.getLogger(__name__)


class TicketAnalyzer(Protocol):
    async def analyze(self, title: str, description: str) -> AISuggestion | None: ...


def parse_suggestion(raw: str) -> AISuggestion | None:
    """Parse and validate the model's JSON output. Returns None if unusable."""
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            # be lenient with casing / spaces the model might add
            for key in ("category", "priority"):
                if isinstance(data.get(key), str):
                    data[key] = normalize_choice(data[key])
        return AISuggestion.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.warning("AI returned invalid output: %s", exc)
        return None


class LLMTicketAnalyzer:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def analyze(self, title: str, description: str) -> AISuggestion | None:
        if not self.settings.llm_api_key:
            logger.warning("LLM_API_KEY not set; skipping AI analysis")
            return None

        payload = {
            "model": self.settings.llm_model,
            "temperature": LLM_TEMPERATURE,
            "response_format": LLM_RESPONSE_FORMAT,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Title: {title}\n\nDescription: {description}"},
            ],
        }
        try:
            async with httpx.AsyncClient(timeout=self.settings.llm_timeout_seconds) as client:
                resp = await client.post(
                    f"{self.settings.llm_base_url}{LLM_CHAT_COMPLETIONS_PATH}",
                    headers={"Authorization": f"Bearer {self.settings.llm_api_key}"},
                    json=payload,
                )
                resp.raise_for_status()
                content = resp.json()["choices"][0]["message"]["content"]
        except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
            logger.error("AI request failed: %s", exc)
            return None

        suggestion = parse_suggestion(content)
        if suggestion:
            logger.info(
                "AI suggestion: category=%s priority=%s",
                suggestion.category.value,
                suggestion.priority.value,
            )
        return suggestion
