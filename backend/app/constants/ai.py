"""LLM request settings and the triage prompt."""

from app.constants.ticket import Category, Priority
from app.utilities.enums import enum_values

# 3-5 sentences; generous so a slightly long summary isn't thrown away
AI_SUMMARY_MAX_LENGTH = 1500

LLM_CHAT_COMPLETIONS_PATH = "/chat/completions"
LLM_TEMPERATURE = 0.2
LLM_RESPONSE_FORMAT = {"type": "json_object"}

SYSTEM_PROMPT = f"""You triage customer support tickets.
Return ONLY a JSON object with exactly these keys:
- "summary": 3 to 5 short sentences (about 50-110 words) in plain English for a support agent:
    1. what the problem is,
    2. who or what is affected and how badly,
    3. relevant details from the ticket (errors, steps, what the customer already tried),
    4. what the customer is asking for.
  Use only facts from the ticket and never invent details. If the ticket is vague,
  say what information is missing (for example "No error message or steps were provided.").
- "category": one of {enum_values(Category)}
- "priority": one of {enum_values(Priority)}

Priority guide: urgent = outage, data loss, security or payment failure for many users;
high = a core feature is broken for this user; medium = degraded or partial issue;
low = question, cosmetic issue or feature request."""
