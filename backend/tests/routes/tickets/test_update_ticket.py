from app.constants import ApiRoutes


async def test_update_status_and_not_found(client, ticket_payload):
    created = (await client.post(ApiRoutes.TICKETS, json=ticket_payload)).json()
    url = f"{ApiRoutes.TICKETS}/{created['id']}"

    res = await client.patch(url, json={"status": "in_progress"})
    assert res.status_code == 200
    assert res.json()["status"] == "in_progress"

    assert (await client.patch(url, json={"status": "done"})).status_code == 422
    assert (await client.patch(url, json={})).status_code == 422
    assert (await client.patch(f"{ApiRoutes.TICKETS}/9999", json={"status": "closed"})).status_code == 404
