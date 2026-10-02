import json

from app.constants import Category, Priority
from app.services.ai_service import parse_suggestion


def test_parse_suggestion_handles_bad_llm_output():
    assert parse_suggestion("not json") is None
    assert parse_suggestion('{"summary": "x", "category": "spaceship", "priority": "low"}') is None

    ok = parse_suggestion('{"summary": "Refund", "category": "Billing", "priority": "HIGH"}')
    assert ok is not None
    assert ok.category == Category.BILLING
    assert ok.priority == Priority.HIGH


def test_parse_suggestion_normalizes_spaces():
    ok = parse_suggestion('{"summary": "Idea", "category": "Feature Request", "priority": "low"}')
    assert ok is not None
    assert ok.category == Category.FEATURE_REQUEST


def test_parse_suggestion_accepts_multi_sentence_summary():
    summary = (
        "The customer was charged twice for the Pro plan this month. "
        "Only their own account is affected. "
        "They have not shared a transaction ID. "
        "They want one of the two charges refunded."
    )
    ok = parse_suggestion(json.dumps({"summary": summary, "category": "billing", "priority": "high"}))
    assert ok is not None
    assert ok.summary == summary
