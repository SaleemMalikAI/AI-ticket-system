from app.constants import ApiRoutes


async def test_create_uses_ai_suggestions_when_user_does_not_override(client, fake_ai, ticket_payload):
    res = await client.post(ApiRoutes.TICKETS, json=ticket_payload)

    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "open"
    assert body["category"] == "account"
    assert body["priority"] == "high"
    assert body["ai_summary"] == "User cannot log in after password reset."
    assert fake_ai.calls == 1


async def test_user_values_override_ai_but_ai_suggestion_is_kept(client, ticket_payload):
    res = await client.post(
        ApiRoutes.TICKETS, json={**ticket_payload, "category": "technical", "priority": "low"}
    )

    body = res.json()
    assert res.status_code == 201
    assert body["category"] == "technical"  # user choice wins
    assert body["priority"] == "low"
    assert body["ai_category"] == "account"  # AI suggestion still recorded
    assert body["ai_priority"] == "high"


async def test_create_succeeds_with_defaults_when_ai_fails(client, fake_ai, ticket_payload):
    fake_ai.result = None  # simulate LLM timeout / bad output

    res = await client.post(ApiRoutes.TICKETS, json=ticket_payload)

    assert res.status_code == 201
    body = res.json()
    assert body["ai_summary"] is None
    assert body["category"] == "general"
    assert body["priority"] == "medium"


async def test_create_validation_errors(client, ticket_payload):
    res = await client.post(ApiRoutes.TICKETS, json={"title": "  ", "description": "short"})
    assert res.status_code == 422

    res = await client.post(ApiRoutes.TICKETS, json={**ticket_payload, "priority": "super-urgent"})
    assert res.status_code == 422
