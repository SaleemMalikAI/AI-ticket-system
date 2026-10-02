from app.constants import ApiRoutes


async def test_delete_ticket(client, ticket_payload):
    created = (await client.post(ApiRoutes.TICKETS, json=ticket_payload)).json()
    url = f"{ApiRoutes.TICKETS}/{created['id']}"

    assert (await client.delete(url)).status_code == 204
    assert (await client.get(url)).status_code == 404
    assert (await client.delete(url)).status_code == 404
