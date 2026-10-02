"""AI triage: summary + suggested category + suggested priority.

Uses any OpenAI-compatible chat completions API (Groq by default).
Never raises to the caller: on any failure it logs and returns None, so
ticket creation keeps working when the LLM is down or misconfigured.
"""

import json
import logging
from typing import Protocol

from pydantic import ValidationError

from app.constants.ai import SYSTEM_PROMPT
from app.core.config import Settings
from app.schemas.ai import AISuggestion
from app.services.llm_client import chat_completion
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
        content = await chat_completion(
            self.settings,
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Title: {title}\n\nDescription: {description}"},
            ],
        )
        if content is None:
            return None

        suggestion = parse_suggestion(content)
        if suggestion:
            logger.info(
                "AI suggestion: category=%s priority=%s",
                suggestion.category.value,
                suggestion.priority.value,
            )
        return suggestion
