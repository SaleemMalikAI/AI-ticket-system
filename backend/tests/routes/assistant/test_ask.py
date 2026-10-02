import pytest

from app.constants import ApiRoutes, AssistantPaths

ASK = f"{ApiRoutes.ASSISTANT}{AssistantPaths.ASK}"


@pytest.fixture
async def seeded(client, ticket_payload):
    """3 tickets: billing/urgent, billing/low, technical/urgent (user-set values)."""
    created = []
    for category, priority, title in [
        ("billing", "urgent", "Charged twice"),
        ("billing", "low", "Invoice question"),
        ("technical", "urgent", "Site is down"),
    ]:
        body = {**ticket_payload, "title": title, "category": category, "priority": priority}
        created.append((await client.post(ApiRoutes.TICKETS, json=body)).json())
    return created


async def ask(client, question="show me tickets"):
    return await client.post(ASK, json={"question": question})


async def test_list_returns_matching_tickets(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "list", "priority": "urgent"}

    res = await ask(client, "urgent tickets?")

    assert res.status_code == 200
    body = res.json()
    assert body["answer"] == "Found 2 urgent-priority tickets."
    assert {t["title"] for t in body["tickets"]} == {"Charged twice", "Site is down"}
    assert body["plan"]["intent"] == "list"
    assert body["plan"]["priority"] == "urgent"
    assert body["stats"] is None
    assert fake_assistant.questions == ["urgent tickets?"]


async def test_list_respects_limit(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "list", "limit": 1}

    body = (await ask(client)).json()

    assert len(body["tickets"]) == 1
    assert body["answer"] == "Found 3 tickets. Showing the 1 most recent."


async def test_count(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "count", "category": "billing"}

    body = (await ask(client, "how many billing tickets?")).json()

    assert body["answer"] == "There are 2 billing tickets."
    assert body["tickets"] == []


async def test_stats_groups_by_requested_field(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "stats", "group_by": "category"}

    body = (await ask(client, "tickets by category")).json()

    assert body["stats"] == {"billing": 2, "technical": 1}
    assert body["answer"] == "3 tickets by category. Billing: 2, Technical: 1."


async def test_stats_defaults_to_status_and_applies_filters(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "stats", "priority": "urgent"}

    body = (await ask(client)).json()

    assert body["stats"] == {"open": 2}


async def test_text_search_and_date_range(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "list", "q": "site", "date_range": "last_7_days"}

    body = (await ask(client)).json()

    assert [t["title"] for t in body["tickets"]] == ["Site is down"]
    assert body["answer"] == 'Found 1 ticket matching "site" from the last 7 days.'


async def test_conversational_reply_is_used_when_grounded(client, fake_assistant, seeded):
    urgent_ids = sorted(t["id"] for t in seeded if t["priority"] == "urgent")
    fake_assistant.plan = {"intent": "list", "priority": "urgent"}
    fake_assistant.reply = (
        f"You have 2 urgent tickets right now: a double charge (#{urgent_ids[0]}) "
        f"and a site outage (#{urgent_ids[1]})."
    )

    body = (await ask(client, "anything urgent?")).json()

    assert body["answer"] == fake_assistant.reply
    # the writer only ever sees the query results
    assert fake_assistant.facts["total"] == 2
    assert sorted(t["id"] for t in fake_assistant.facts["tickets"]) == urgent_ids


async def test_count_reply_must_use_the_real_number(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "count", "category": "billing"}

    fake_assistant.reply = "Looks like you have 2 billing tickets at the moment."
    assert (await ask(client)).json()["answer"] == fake_assistant.reply

    fake_assistant.reply = "You have about 7 billing tickets."  # wrong number
    assert (await ask(client)).json()["answer"] == "There are 2 billing tickets."


async def test_summary_must_cite_fetched_tickets(client, fake_assistant, seeded):
    technical = next(t for t in seeded if t["category"] == "technical")
    fake_assistant.plan = {"intent": "summarize", "category": "technical"}

    fake_assistant.reply = f"The only technical issue is a site outage (#{technical['id']})."
    assert (await ask(client)).json()["answer"] == fake_assistant.reply


@pytest.mark.parametrize("reply", ["The site is down for everyone.", "See #9999 for details.", None])
async def test_ungrounded_summary_falls_back(client, fake_assistant, seeded, reply):
    fake_assistant.plan = {"intent": "summarize", "category": "technical"}
    fake_assistant.reply = reply

    answer = (await ask(client)).json()["answer"]

    assert answer.startswith("Found 1 technical ticket.")
    assert "summary was unavailable" in answer


async def test_empty_result_reply(client, fake_assistant, seeded):
    fake_assistant.plan = {"intent": "list", "status": "closed"}
    fake_assistant.reply = "Good news: there are no closed tickets yet."

    assert (await ask(client)).json()["answer"] == fake_assistant.reply


@pytest.mark.parametrize(
    "raw",
    [
        "not json",
        '{"intent": null}',  # planner refused (off-topic question)
        '{"intent": "delete"}',
        '{"intent": "list", "status": "deleted"}',
        '{"intent": "list", "q": "' + "x" * 101 + '"}',
    ],
)
async def test_invalid_plan_returns_friendly_hint(client, fake_assistant, seeded, raw):
    fake_assistant.plan = raw

    res = await ask(client, "make me a sandwich")

    assert res.status_code == 200
    body = res.json()
    assert body["plan"] is None
    assert body["tickets"] == []
    assert "open urgent tickets" in body["answer"]


async def test_ai_unavailable_returns_503(client, fake_assistant):
    fake_assistant.plan = None

    res = await ask(client)

    assert res.status_code == 503
    assert res.json()["detail"] == "The AI assistant is unavailable right now. Please try again in a moment."


@pytest.mark.parametrize("question", ["", "  ", "hi", "x" * 301])
async def test_question_validation(client, question):
    assert (await ask(client, question)).status_code == 422
