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

from app.config import Settings, get_settings
from app.models import Category, Priority
from app.schemas import AISuggestion

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = f"""You triage customer support tickets.
Return ONLY a JSON object with exactly these keys:
- "summary": one sentence, max 25 words, describing the user's problem
- "category": one of {[c.value for c in Category]}
- "priority": one of {[p.value for p in Priority]}

Priority guide: urgent = outage, data loss, security or payment failure for many users;
high = a core feature is broken for this user; medium = degraded or partial issue;
low = question, cosmetic issue or feature request."""


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
                    data[key] = data[key].strip().lower().replace(" ", "_")
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
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Title: {title}\n\nDescription: {description}"},
            ],
        }
        try:
            async with httpx.AsyncClient(timeout=self.settings.llm_timeout_seconds) as client:
                resp = await client.post(
                    f"{self.settings.llm_base_url}/chat/completions",
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


def get_analyzer() -> TicketAnalyzer:
    """FastAPI dependency (overridden with a fake in tests)."""
    return LLMTicketAnalyzer(get_settings())
