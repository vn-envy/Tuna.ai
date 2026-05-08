# Tuna

**Plan once. Tuna keeps swimming.**

Tuna is a migratory AI travel agent. You describe a trip, Tuna plans it, then keeps watching every variable that could change it — prices, schedules, weather, advisories — and tells you the moment something shifts. You stay in control of every booking. Tuna handles the swimming.

---

## Status

🐟 **Day 1 of 9 — building in public.**

Follow along: this repo is updated daily as the build progresses.

## Why Tuna

Most travel apps are snapshots. You search, you book, you're on your own. When the price drops, you don't know. When the storm comes, you scramble. When your flight gets moved, you replan from scratch.

Tuna is a current. It keeps swimming. Your trip is alive from intent to return flight.

## How it works

Five specialist agents coordinate on every trip:

- **Scout** researches destinations using grounded web search
- **Navigator** plans the itinerary with costs and routing
- **Compass** critiques the plan for feasibility, season, conflicts
- **Pilot** generates booking deep-links for human approval
- **Currents** monitors the trip continuously and triggers replans

A human approves the plan before any booking. Tuna never books autonomously.

## Architecture

- **Agents:** Google Agent Development Kit (ADK) on Vertex AI Agent Engine
- **Models:** Gemini 3.1 Pro (planning, critique) and Gemini 3.1 Flash (research, monitor)
- **Memory:** Vertex AI Memory Bank (preferences) + Cloud SQL Postgres with pgvector (trips, wishlist)
- **Grounding:** Google Search + URL Context (native Gemini tools)
- **Web:** Next.js on Cloud Run
- **Monitoring loop:** Cloud Scheduler → Pub/Sub → Cloud Run job
- **Observability:** Cloud Trace, Cloud Logging, Cloud Monitoring

Region: `asia-south1` (Mumbai).

## Repo layout

```
tuna/
├── infra/          Terraform + SQL migrations
├── agents/         ADK agents, tools, prompts, schemas
├── web/            Next.js frontend
├── monitor-worker/ Cloud Run job for the replan loop
└── scripts/        Deploy + dev helpers
```

## Build log

| Day | Status | What shipped |
|---|---|---|
| 1 | ⏳ in progress | Project bootstrap, Terraform, schema, ADK skeleton, Next.js scaffold, end-to-end deploy |
| 2 | — | Scout (Research) + intent extraction |
| 3 | — | Navigator + Compass (Planner + Critic) |
| 4 | — | Memory Bank + Wishlist (paste-a-link, manual, chat-driven) |
| 5 | — | Human-in-the-loop approval, Trip Canvas |
| 6 | — | Pilot (Booking Handoff) + deep links |
| 7 | — | Currents (Monitor) + replan loop |
| 8 | — | Observability + notifications |
| 9 | — | End-to-end hardening, 5 trip scenarios |

## License

MIT — see [LICENSE](./LICENSE).

## Author

Built by [@Builder-Neekhil](https://huggingface.co/Builder-Neekhil) — building in public.
