# AI-ticket-system

Support ticket management with AI triage. Every new ticket gets a 3–5 sentence AI summary plus a
suggested category and priority (which people can override), and an **Ask AI** assistant answers
questions about the ticket queue in plain English.

**Stack:** Next.js 15 (App Router, Tailwind v4) · FastAPI · SQLAlchemy 2 (async) · PostgreSQL 16 ·
Alembic · Groq (any OpenAI-compatible LLM API) · Docker Compose

## Prerequisites

**The normal path is Docker only — you do not need Node, Python or Postgres installed.**

| Tool | Required | Why |
|---|---|---|
| Docker Engine with the Compose **v2** plugin | yes | Everything is wired in `docker-compose.yml`; the old `docker-compose` v1 command will not work — check with `docker compose version` |
| Ports 3000, 8000, 5432 free | yes | Frontend, API and Postgres are published on the host |
| An OpenAI-compatible LLM API key | optional | Without it the app still runs: default triage, Ask AI returns 503 |

**Only if you want to run something outside Docker:**

| Tool | Version | Notes |
|---|---|---|
| Python | 3.12+ | Matches the backend image (`python:3.12-slim`); `cd backend && pip install -r requirements.txt` |
| Node.js + npm | 22+ / 10+ | Matches the frontend image (`node:22-alpine`); `cd frontend && npm ci` |
| PostgreSQL | 16 (or any reachable server) | Point `DATABASE_URL` at it; only Postgres is supported, not SQLite outside tests |

The backend image runs as a non-root user (`appuser`) and the frontend as `node`, so nothing needs
root on your machine. Build the images once with `docker compose up --build -d`; Compose starts
Postgres and waits for its healthcheck before the backend migrates and serves.

## Quick start

1. Create your env file from the committed template:

   ```bash
   cp .env.example .env    # .env is gitignored — never commit it
   ```

   `.env.example` is tracked and holds only defaults, never a real key. Fill in at least
   `LLM_API_KEY`; everything else has a working default:

   | Variable | Example | Notes |
   |---|---|---|
   | `LLM_API_KEY` | `gsk_…` | Free key at https://console.groq.com/keys |
   | `LLM_BASE_URL` | `https://api.groq.com/openai/v1` | Any OpenAI-compatible API |
   | `LLM_MODEL` | `openai/gpt-oss-20b` | Must support JSON mode |
   | `LLM_TIMEOUT_SECONDS` | `10` | Per LLM call |
   | `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `postgres` / `postgres` / `tickets` | |
   | `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/tickets` | Only needed outside Docker; Compose overrides it |
   | `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated list |
   | `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL as seen by the browser |
   | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Used for canonical URLs and the sitemap |

2. Start everything:

   ```bash
   docker compose up --build -d
   ```

| What | URL |
|---|---|
| Landing page | http://localhost:3000 |
| Tickets | http://localhost:3000/tickets |
| Ask AI | http://localhost:3000/ask |
| API docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | `postgresql://postgres:postgres@localhost:5432/tickets` |

Without an `LLM_API_KEY` the app still works: tickets get default triage, and Ask AI returns 503.

### Secrets

- `.env` is gitignored (`.gitignore` covers `.env` and `.env.*`) and must never be committed.
- `.env.example` is the exception — a sanitized template with an **empty** `LLM_API_KEY`. If a real
  key ever lands in it, or in any tracked file, rotate that key first; git history keeps it.
- `NEXT_PUBLIC_*` values are compiled into the browser bundle. Never put a secret in them: anything
  prefixed `NEXT_PUBLIC_` is readable by anyone using the site.

### Database and migrations

Compose creates the database for you (`POSTGRES_*` above, data kept in the `pgdata` volume). The
backend container runs `alembic upgrade head` before uvicorn, so a fresh checkout needs no manual
schema step. There is no seed data — create tickets through the UI or `POST /api/tickets`.

Running the backend outside Docker, do it by hand:

```bash
# 1. a reachable Postgres, e.g. the Compose one:
docker compose up -d db
# DATABASE_URL must point at localhost here (Compose's own override targets the "db" host)

# 2. create the database if it does not exist yet
docker compose exec db psql -U postgres -c "CREATE DATABASE tickets;"

# 3. migrate, then serve
cd backend && pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

`alembic.ini` deliberately has no `sqlalchemy.url` — `alembic/env.py` reads `DATABASE_URL` from the
same settings object as the app, so there is exactly one place the connection is configured.

Changing the schema:

```bash
cd backend
alembic revision --autogenerate -m "add foo to tickets"   # then read the generated file
alembic upgrade head
```

`0001_create_tickets.py` duplicates the enum values from `app/constants/ticket.py`; if you add a
category, priority or status, edit both the `StrEnum` and the migration's CHECK constraint.

### Tests and checks

```bash
docker compose exec backend pytest -v      # backend (SQLite in-memory, LLM faked)
cd frontend && npm run lint && npm run build
```

## Features

- **AI triage on create:** a 3–5 sentence summary (problem, impact, key details, what the
  customer wants) + suggested category/priority. User choices always win, and the
  AI suggestion is stored separately so overrides stay visible. If the LLM fails, the ticket is
  still created with defaults (General / Medium).
- **Ticket list:** filter by status, category, priority and free-text search (`q`); filters live
  in the URL so views are shareable.
- **Ticket page:** AI analysis, edit status/category/priority with a confirmation dialog, delete
  with confirmation.
- **Ask AI:** see below.

## Ask AI

Ask questions like *"open urgent tickets"*, *"how many billing tickets came in this week?"*,
*"tickets by priority"* or *"summarize the technical issues"*.

```
question ─► LLM planner ─► JSON QueryPlan ─► Pydantic validation ─► repository query ─► results
                                                │ invalid / off-topic                      │
                                                └─► 200 + "try e.g. …" hint                ▼
            chat reply ◄─ grounding check ◄─ LLM writes a reply from ONLY those results ◄──┘
                              │ fails
                              └─► templated answer built from the results
```

The planner may only return this shape (anything else fails validation):

| Field | Allowed values |
|---|---|
| `intent` | `list`, `count`, `stats`, `summarize` |
| `status` / `category` / `priority` | the ticket enums, or `null` |
| `q` | search text, max 100 chars, or `null` |
| `date_range` | `today`, `last_7_days`, `last_30_days`, or `null` |
| `group_by` | `status`, `category`, `priority`, or `null` (stats; defaults to status) |
| `limit` | 1–20, default 10 (larger requests are clamped) |

The UI is a chat: each reply is a short natural-language answer (ticket mentions like `#12`
are links), plus a small **View in ticket list** link that reapplies the same filters on
`/tickets`. The API still returns the plan, tickets and stats for other clients.

### Design rationale

- **Why not text-to-SQL?** Letting a model write SQL means trusting generated code against the
  database: injection, accidental writes, expensive or wrong joins, and queries that are hard to
  review. Here the model only *chooses values from a small, closed vocabulary*. Pydantic rejects
  anything outside it, group-by columns come from a whitelist, and the query itself is ordinary,
  tested repository code. The worst a bad plan can do is apply the wrong filter, which
  "View in ticket list" makes easy to check.
- **Prompt injection:** the question is wrapped in `<question>` tags (tags inside it are
  neutralised) and the prompt says to treat it as data. Even if the model is fooled, its output
  must still validate as a read-only `QueryPlan`; off-topic or malicious questions get the hint.
- **Grounding:** the reply is written by a second LLM call that sees **only** the query results
  (total, group counts and the fetched tickets' id, title, summary, status, priority and
  category), never the database. The reply is then checked against those results: it may only
  cite fetched tickets as `#id`, a summary must cite at least one, and otherwise it must state
  the real total (or "no/none" for zero). If any check fails, a templated answer built straight
  from the results is used instead, so numbers always come from the database.
- **Failure modes:** any LLM error returns `None` instead of raising. An unusable plan is a
  `200` with example questions; an unreachable LLM is a `503` so the UI can offer a retry.
- **Testability:** the planner and reply writer are one FastAPI dependency
  (`get_assistant_llm`), so the tests swap in a fake and never call the network.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness + database check → `{"status": "ok"}` |
| GET | `/api/tickets` | List tickets, newest first. Query: `status`, `category`, `priority`, `q`, `limit` (1–100), `offset` |
| POST | `/api/tickets` | Create a ticket; AI fills summary and any category/priority left empty |
| GET | `/api/tickets/{id}` | Get one ticket |
| PATCH | `/api/tickets/{id}` | Update `status`, `category` and/or `priority` |
| DELETE | `/api/tickets/{id}` | Delete a ticket (204) |
| POST | `/api/assistant/ask` | Ask AI. Body `{"question": "…"}` (3–300 chars) → `{answer, plan, tickets, stats}`; 503 if the AI is unavailable |

Example:

```bash
curl -X POST http://localhost:8000/api/assistant/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "how many billing tickets came in this week?"}'
```

```json
{
  "answer": "You've had 2 billing tickets in the last 7 days.",
  "plan": { "intent": "count", "category": "billing", "date_range": "last_7_days", "status": null,
            "priority": null, "q": null, "group_by": null, "limit": 10 },
  "tickets": [],
  "stats": null
}
```

## Project structure

```
backend/app/
  api/routes/          one file per endpoint (tickets/, assistant/, health.py)
  services/            business logic: ticket_service, ai_service, assistant_service, llm_client
  repositories/        SQL only (ticket_repository)
  schemas/ models/     Pydantic shapes / SQLAlchemy tables
  constants/           enums, limits, prompts, API paths, messages
backend/tests/         mirrors routes/ and services/

frontend/src/
  app/                 route groups: (marketing) landing, (tickets), (assistant)
  components/          ui/, layout/, tickets/, assistant/, landing/
  constants/           Pages, Links, ApiRoutes enums, page metadata, copy
  rest-api/            apiRequest client + one routes.ts per resource
  types/ utilities/
```

## Known limitations

Security and scope:

- **No authentication or authorization.** Every endpoint is open: anyone who reaches the API can
  read, edit and delete any ticket, and can spend LLM budget through `/api/assistant/ask`.
- **No rate limiting** on ticket creation or on Ask AI, so the LLM key is an unbounded cost.
- **Ask AI is single-turn.** Only the current question is sent, so follow-ups like "and the urgent
  ones?" restart from nothing. The plan vocabulary is also a closed set: questions outside it get the
  example hint rather than an answer.

Performance and correctness:

- **No streaming or cancellation.** A question waits for two sequential LLM calls (planner, then
  answer writer), so a slow model blocks the request for up to roughly `2 × LLM_TIMEOUT_SECONDS`, and
  nothing aborts a hung call.
- **Nothing is cached.** Every frontend request uses `cache: "no-store"`, and the ticket detail page
  fetches the ticket twice per request (once for `generateMetadata`, once for the page). There is no
  server-side cache or ISR.
- **Search is a full table scan.** `%term%` `ILIKE` across title, description and AI summary has no
  trigram index — fine at demo size, linear beyond it.
- **Stats skip empty buckets.** "Tickets by status" returns only statuses that actually have tickets,
  and `total` is the sum of the returned groups.
- **"Today" means UTC.** Date ranges start at UTC midnight, so users east of UTC see the next day's
  tickets excluded from "today".
- **Pagination is API-only.** `limit`/`offset` exist on the list endpoint, but the UI never sends them:
  the list shows the first 50 tickets with no way to reach the rest.

Operations and code health:

- **No frontend tests and no CI.** Only the backend suite runs (in-memory SQLite); nothing runs on
  push, and Postgres is exercised only by hand. `conftest.py` already honours `TEST_DATABASE_URL`
  if you want to close that gap.
- **Enum values are duplicated in the migration.** `alembic/versions/0001_create_tickets.py`
  hardcodes the categories, priorities and statuses, so adding one means editing the migration and
  changing a DB constraint, not just the `StrEnum`.
- **Migrations run in the backend's startup command.** That assumes a single replica (two would race
  on `alembic upgrade head`), and neither `backend` nor `frontend` declares a Docker healthcheck, so
  `depends_on` does not wait for the API to be serving.
- **The ticket model is minimal:** no assignee, comments, status history or tags, and `DELETE` removes
  the row and its AI analysis for good (no soft delete or audit trail).

## What production would need

Roughly in order of impact:

1. **Auth first.** Authentication plus per-role authorization on every route, then rate limits on
   creation and Ask AI. Nothing else on this list matters as much while the API is open.
2. **Real search.** A `pg_trgm` GIN index (or a `tsvector` column) over title, description and
   ai_summary. `build_filters()` in the repository stays the single place that builds the query.
3. **Streaming Ask AI.** Server-sent events for the answer, an `AbortSignal` wired to the input being
   re-submitted, and conversation history so follow-ups work. Keep the plan validation and the
   grounding check — they are what make the feature safe.
4. **Pagination in the UI**, with keyset/cursor paging on the API so deep pages stay cheap; the extra
   `COUNT` query can go away with it.
5. **Caching and revalidation.** Stop forcing `no-store` on pages that are not per-user, and revalidate
   the list and detail pages on write instead.
6. **Move migrations into a one-shot job** (or `alembic` as a separate Compose service), and add real
   healthchecks so `depends_on: {condition: service_healthy}` works for backend and frontend.
7. **Observability.** Request IDs, structured logs, latency and error metrics, LLM token/cost tracking,
   and counters for the paths that fail silently today: the 503 when AI is unavailable and the
   `grounded_reply` rejections in the log.
8. **LLM resilience.** Retries with backoff, a per-call timeout budget across both calls, and triage in
   a background job so creating a ticket never blocks on the model.
9. **Tests in CI.** Frontend component tests for the ticket flow and the chat, the backend suite
   against Postgres, and a migration smoke test so `alembic upgrade head` is proven, not assumed.
10. **Schema work.** Generate migration enums from the constants instead of copying them, and add soft
    delete plus a status history table if the product needs an audit trail.
