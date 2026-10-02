# AI-ticket-system

Support ticket management with AI triage. Every new ticket gets a 3–5 sentence AI summary plus a
suggested category and priority (which people can override), and an **Ask AI** assistant answers
questions about the ticket queue in plain English.

**Stack:** Next.js 15 (App Router, Tailwind v4) · FastAPI · SQLAlchemy 2 (async) · PostgreSQL 16 ·
Alembic · Groq (any OpenAI-compatible LLM API) · Docker Compose

## Quick start

1. Create a `.env` file in the repo root (it is gitignored, never commit it):

   | Variable | Example | Notes |
   |---|---|---|
   | `LLM_API_KEY` | `gsk_…` | Free key at https://console.groq.com/keys |
   | `LLM_BASE_URL` | `https://api.groq.com/openai/v1` | Any OpenAI-compatible API |
   | `LLM_MODEL` | `openai/gpt-oss-20b` | Must support JSON mode |
   | `LLM_TIMEOUT_SECONDS` | `10` | |
   | `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `postgres` / `postgres` / `tickets` | |
   | `CORS_ORIGINS` | `http://localhost:3000` | |
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

Migrations run automatically when the backend starts. Without an `LLM_API_KEY` the app still
works: tickets get default triage, and Ask AI returns 503.

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
