from app.constants import ApiRoutes


async def test_health_checks_database(client):
    res = await client.get(ApiRoutes.HEALTH)

    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
