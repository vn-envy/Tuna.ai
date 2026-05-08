# Tuna.ai 🐟

> **Your AI travel planning buddy built specifically for content creators.**

Tuna.ai is a multiagent travel planning and experience engine designed to solve the unique logistical nightmares faced by travel influencers. Inspired by the companion-style interface of Clicky, Tuna.ai acts as an always-on co-pilot to research, plan, and execute travel content schedules.

---

## 🚀 The Challenge We're Solving

Travel content creators face 6 critical pain points that standard travel apps ignore:
1. **The Fragmented Ecosystem**: Jumping between 30+ tools to plan a trip.
2. **The Golden Hour Scramble**: Re-engineering entire days around 20-minute lighting windows.
3. **Plans Shattering on Contact**: Weather and delays ruining rigid content schedules.
4. **Content vs. Actually Living**: Failing to balance shoot time with experience time.
5. **The "Will This Actually Look Good?" Gamble**: Traveling to a spot only to find it unphotogenic.
6. **Budget Chaos**: Managing expenses across multiple currencies and sponsors.
7. **The Cold Pitch Blackhole**: Sending generic emails to hotels that get ignored.
8. **Missed Networking**: Traveling to a new country and missing the chance to collaborate with local or overlapping creators.

**Tuna.ai solves this by acting as a specialized AI travel team** built on the Google Agent Development Kit (ADK), integrated directly into a companion chat interface.

---

## 🧠 Approach & Logic

We built a **multiagent system** with specialized sub-agents, orchestrated by a root agent ("Tuna").

1. **Frontend (Next.js + Tailwind)**: A split-view web application. The left panel contains the interactive Map, Itinerary Board, and Budget tools. The right panel is a persistent **Companion Chat** (streaming via SSE) that feels conversational rather than transactional.
2. **Backend (Python FastAPI + Google ADK)**: The intelligence layer.
    *   **Tuna (Orchestrator Agent)**: Understands user intent and delegates tasks.
    *   **Destination Scout**: Uses Google Places to find "Instagrammable" spots.
    *   **Itinerary Architect**: Uses Google Directions and Calendar to build time-blocked schedules explicitly anchored around *Golden Hour*.
    *   **Content Strategist**: Analyzes YouTube data to find content gaps.
    *   **Logistics Manager**: Handles emails (Gmail API) and budgets (Sheets API).
    *   **Partnership Broker (V2)**: The business developer. Scrapes hotel marketing priorities to draft hyper-personalized pitch emails for comped stays, and scans for overlapping creators to suggest specific video collaborations (the "Collab Radar").

---

## 🛠️ How It Works (Technical Implementation)

*   **Code Quality**: TypeScript for the frontend, Python 3.11+ for the backend. Clean separation of concerns with React components and FastAPI service layers.
*   **Security**: Uses Firebase Auth (Google Sign-in). The FastAPI backend utilizes custom middleware to verify the `Authorization: Bearer <token>` JWT before processing chat requests, ensuring only authenticated creators can access their AI team.
*   **Efficiency**: The chat uses Server-Sent Events (SSE) for real-time streaming, preventing long-polling overhead.
*   **Google Services**: 
    *   **Gemini 2.5 Flash**: Core reasoning engine.
    *   **Google ADK**: Agent orchestration.
    *   **Maps JS API**: For interactive plotting of suggested places.
    *   **Places API**: Used by the ADK agent to search for photogenic spots.

---

## ⚠️ Assumptions Made for Hackathon MVP

Due to the rapid development cycle of this hackathon submission, we made the following assumptions:
1.  **Auth Simulation**: The Google Sign-in flow sets a simulated secure token that the backend middleware successfully validates, proving the security architecture without requiring complex OAuth consent screen setups for the judges.

---

## 💻 Running Locally

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000`
