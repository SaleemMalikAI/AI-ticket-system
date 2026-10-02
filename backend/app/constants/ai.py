"""LLM request settings and the triage prompt."""

from app.constants.ticket import Category, Priority
from app.utilities.enums import enum_values

AI_SUMMARY_MAX_LENGTH = 500

LLM_CHAT_COMPLETIONS_PATH = "/chat/completions"
LLM_TEMPERATURE = 0.2
LLM_RESPONSE_FORMAT = {"type": "json_object"}

SYSTEM_PROMPT = f"""You triage customer support tickets.
Return ONLY a JSON object with exactly these keys:
- "summary": one sentence, max 25 words, describing the user's problem
- "category": one of {enum_values(Category)}
- "priority": one of {enum_values(Priority)}

Priority guide: urgent = outage, data loss, security or payment failure for many users;
high = a core feature is broken for this user; medium = degraded or partial issue;
low = question, cosmetic issue or feature request."""
