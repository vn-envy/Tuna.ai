# Architecture

This is the source of truth for what Tuna is and how it's built.
If code disagrees with this doc, the doc wins until updated.

## Product scope (v1)

Tuna v1 is a web app that:

1. Takes a natural-language travel intent
2. Researches destinations using grounded web search
3. Plans an itinerary with costs and routing
4. Critiques the plan for feasibility
5. Asks the user to approve or edit
6. Generates booking deep-links (Google Flights, Booking.com, Viator, Maps)
7. Monitors the trip every hour for price drift, schedule changes, weather, advisories
8. Triggers a replan when thresholds are breached, with user approval

Out of scope for v1: autonomous booking, mobile, desktop menu-bar app, browser extension, ambient capture.

## Agent topology

Five specialists coordinated as a SequentialAgent during planning, plus an event-driven Currents worker.

```
RootAgent (intent + delegation, Gemini 3.1 Pro)
   │
   ├─ Scout (research, Gemini 3.1 Flash) — google_search, url_context, weather, advisories
   ├─ Navigator (planner, Gemini 3.1 Pro) — cost, visa, distance
   ├─ Compass (critic, Gemini 3.1 Pro) — validate, seasonality, conflicts
   │
   ├─ [HUMAN APPROVAL via long-running tool]
   │
   └─ Pilot (booking handoff, Gemini 3.1 Flash) — deep-link builders

Currents (monitor, Gemini 3.1 Flash, runs hourly via Pub/Sub)
   └─ on drift → enqueue replan → re-enters Navigator with delta context
```

Naming: agents have user-facing names (Scout, Navigator, etc.) and internal class names (`ResearchAgent`, etc.). The user names are the brand surface; the class names are the implementation.

## Memory layers

Three distinct stores. Don't conflate.

| Layer | Where | Holds |
|---|---|---|
| Session state | Vertex AI Session | Current conversation, draft plan, approval status |
| Long-term semantic | Vertex AI Memory Bank | Cross-session user preferences ("vegetarian, aisle seat") |
| Trip episodic | Cloud SQL Postgres | Every trip ever planned/taken, fully searchable + vector |

## Data model (Cloud SQL Postgres + pgvector)

```sql
users (id, email, created_at, settings_json)

trips (
  id, user_id, status, intent_json, plan_json,
  baseline_costs_json, created_at, traveled_at
)

trip_events (
  trip_id, ts, event_type, payload_json
)  -- price drops, replans, approvals, notifications

wishlist_items (
  id, user_id, source_type, source_url, captured_at, capture_method,
  location_text, location_geo,
  vibe_tags, price_band, season_hint, hook,
  raw_text, user_note,
  embedding vector(3072)  -- gemini-embedding-001
)

trip_embeddings (trip_id, embedding vector(3072))
```

`location_geo` uses PostGIS for radius queries. `embedding` uses pgvector ivfflat.

## Models

| Use case | Model | Why |
|---|---|---|
| Intent extraction, planning, critique | `gemini-3.1-pro` | Reasoning quality matters |
| Research, monitor, deep-link builder | `gemini-3.1-flash` | High-volume, cost-sensitive |
| Embeddings | `gemini-embedding-001` | Latest Google embedding model, 3072 dims |

`gemini-3-pro-preview` was deprecated 2026-03-26. Always use `gemini-3.1-pro-preview` until GA name lands.

## Grounding rules (load-bearing)

Every price, schedule, or availability claim **must** come from a `google_search` or `url_context` call. Never from model memory.

- All grounded responses are stored with source URL + retrieval timestamp in `trip_events`
- Currents compares to real baselines, not vibes
- Baselines expire after 6h — Currents refreshes before comparing
- Pilot never invents prices; only links out. User sees live price on the partner site.

## Human-in-the-loop checkpoints

Three. Implemented via ADK long-running tools.

1. **Intent confirmation** after Root extracts intent
2. **Plan approval** after Compass passes
3. **Replan approval** when Currents flags drift

No autonomous action ever crosses #2.

## Observability

Cloud Trace + Logging + Monitoring. Skip Langfuse — pure-Google stack.

Every tool call adds custom span attributes: `user_id`, `trip_id`, `tool_input_hash`, `tokens_in`, `tokens_out`, `cost_usd`. Compass verdicts log structured (`passed`, `failed`, `reason`).

Dashboard tracks: agent latency p50/p95/p99, tool error rate, cost per session, Compass rejection rate.

## Replan loop

Cloud Scheduler → Pub/Sub `currents.tick` (hourly) → Cloud Run job:

1. Pull active trips (`status = 'approved'`, `traveled_at > now()`)
2. For each: run Currents in monitor mode (cheaper Flash prompt)
3. Compute deltas vs baseline
4. If delta breaches threshold (flight ±10%, hotel ±15%, weather alert, advisory change) → publish `replan.needed`
5. Worker on `replan.needed` triggers Navigator with delta context
6. Compass passes → notify user (email) → checkpoint #3

Threshold logic in code, not LLM. LLMs are bad at "is 11.3% > 10%."

## Deployment

| Component | Where |
|---|---|
| Agents | Vertex AI Agent Engine (managed) |
| Web | Cloud Run (Next.js) |
| Monitor worker | Cloud Run job |
| Database | Cloud SQL Postgres 16 with pgvector + PostGIS |
| Scheduler | Cloud Scheduler |
| Pub/Sub | `currents.tick`, `replan.needed`, `notify.user` |
| Storage | Cloud Storage (capture artifacts, future) |
| Secrets | Secret Manager |

Region: `asia-south1` for everything. Single region for v1.

## Cost ceiling (target)

- Gemini 3.1 Pro plan generation: $0.10–0.30 per session
- Currents on Flash: $0.005 per check
- Cloud SQL idle: ~$15/mo
- Cloud Run idle: ~$0
- Memory Bank: $0.25 per 1k memories

Target: <$50/mo for 100 active trips. Alert at 80%.

## Scenarios (Day 9 regression suite)

These pass = ship.

1. Solo city break — 4 days Lisbon
2. Multi-city Europe — 10 days AMS → BER → PRG
3. Beach + activities — 1 week Bali couple
4. Family of 4 — Tokyo + Kyoto, 8 days, kids 6 and 9
5. Business + leisure — Singapore conference + 4 days SE Asia personal

Fixtures in `/agents/tests/scenarios/`.
