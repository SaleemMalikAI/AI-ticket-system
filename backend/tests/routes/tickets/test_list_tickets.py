from app.constants import ApiRoutes, Category, Priority
from app.schemas import AISuggestion


async def test_list_filters(client, fake_ai, ticket_payload):
    await client.post(ApiRoutes.TICKETS, json=ticket_payload)  # account / high
    fake_ai.result = AISuggestion(
        summary="Refund request.", category=Category.BILLING, priority=Priority.LOW
    )
    await client.post(ApiRoutes.TICKETS, json={**ticket_payload, "title": "Refund please"})

    all_ = (await client.get(ApiRoutes.TICKETS)).json()
    assert all_["total"] == 2

    billing = (await client.get(ApiRoutes.TICKETS, params={"category": "billing"})).json()
    assert billing["total"] == 1
    assert billing["items"][0]["title"] == "Refund please"

    none = (await client.get(ApiRoutes.TICKETS, params={"status": "closed"})).json()
    assert none == {"items": [], "total": 0}

    assert (await client.get(ApiRoutes.TICKETS, params={"priority": "nope"})).status_code == 422
    assert (await client.get(ApiRoutes.TICKETS, params={"limit": 0})).status_code == 422
