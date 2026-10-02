from app.constants import ApiRoutes


async def test_get_ticket_and_not_found(client, ticket_payload):
    created = (await client.post(ApiRoutes.TICKETS, json=ticket_payload)).json()

    res = await client.get(f"{ApiRoutes.TICKETS}/{created['id']}")
    assert res.status_code == 200
    assert res.json() == created

    res = await client.get(f"{ApiRoutes.TICKETS}/9999")
    assert res.status_code == 404
    assert res.json() == {"detail": "Ticket 9999 not found"}
