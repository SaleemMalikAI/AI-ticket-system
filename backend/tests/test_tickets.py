from app.models import Category, Priority
from app.schemas import AISuggestion
from app.services.ai import parse_suggestion

VALID = {
    "title": "Cannot log in",
    "description": "After resetting my password I get 'invalid credentials' every time.",
}


async def test_create_uses_ai_suggestions_when_user_does_not_override(client, fake_ai):
    res = await client.post("/api/tickets", json=VALID)

    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "open"
    assert body["category"] == "account"
    assert body["priority"] == "high"
    assert body["ai_summary"] == "User cannot log in after password reset."
    assert fake_ai.calls == 1


async def test_user_values_override_ai_but_ai_suggestion_is_kept(client):
    res = await client.post(
        "/api/tickets", json={**VALID, "category": "technical", "priority": "low"}
    )

    body = res.json()
    assert res.status_code == 201
    assert body["category"] == "technical"  # user choice wins
    assert body["priority"] == "low"
    assert body["ai_category"] == "account"  # AI suggestion still recorded
    assert body["ai_priority"] == "high"


async def test_create_succeeds_with_defaults_when_ai_fails(client, fake_ai):
    fake_ai.result = None  # simulate LLM timeout / bad output

    res = await client.post("/api/tickets", json=VALID)

    assert res.status_code == 201
    body = res.json()
    assert body["ai_summary"] is None
    assert body["category"] == "general"
    assert body["priority"] == "medium"


async def test_create_validation_errors(client):
    res = await client.post("/api/tickets", json={"title": "  ", "description": "short"})
    assert res.status_code == 422

    res = await client.post("/api/tickets", json={**VALID, "priority": "super-urgent"})
    assert res.status_code == 422


async def test_update_status_and_not_found(client):
    created = (await client.post("/api/tickets", json=VALID)).json()

    res = await client.patch(f"/api/tickets/{created['id']}", json={"status": "in_progress"})
    assert res.status_code == 200
    assert res.json()["status"] == "in_progress"

    assert (await client.patch(f"/api/tickets/{created['id']}", json={"status": "done"})).status_code == 422
    assert (await client.patch(f"/api/tickets/{created['id']}", json={})).status_code == 422
    assert (await client.patch("/api/tickets/9999", json={"status": "closed"})).status_code == 404


async def test_list_filters(client, fake_ai):
    await client.post("/api/tickets", json=VALID)  # account / high
    fake_ai.result = AISuggestion(
        summary="Refund request.", category=Category.billing, priority=Priority.low
    )
    await client.post("/api/tickets", json={**VALID, "title": "Refund please"})

    all_ = (await client.get("/api/tickets")).json()
    assert all_["total"] == 2

    billing = (await client.get("/api/tickets", params={"category": "billing"})).json()
    assert billing["total"] == 1
    assert billing["items"][0]["title"] == "Refund please"

    none = (await client.get("/api/tickets", params={"status": "closed"})).json()
    assert none == {"items": [], "total": 0}

    assert (await client.get("/api/tickets", params={"priority": "nope"})).status_code == 422


async def test_delete_ticket(client):
    created = (await client.post("/api/tickets", json=VALID)).json()

    assert (await client.delete(f"/api/tickets/{created['id']}")).status_code == 204
    assert (await client.get(f"/api/tickets/{created['id']}")).status_code == 404
    assert (await client.delete(f"/api/tickets/{created['id']}")).status_code == 404


def test_parse_suggestion_handles_bad_llm_output():
    assert parse_suggestion("not json") is None
    assert parse_suggestion('{"summary": "x", "category": "spaceship", "priority": "low"}') is None

    ok = parse_suggestion('{"summary": "Refund", "category": "Billing", "priority": "HIGH"}')
    assert ok is not None
    assert ok.category == Category.billing
    assert ok.priority == Priority.high
