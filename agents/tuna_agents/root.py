"""Tuna Root Agent.

The Root agent is the first agent the user talks to. Its job:
  1. Greet warmly, terse — Tuna's voice (calm, no fluff).
  2. Extract structured travel intent from natural language.
  3. Confirm the intent with the user (HITL checkpoint #1 — added Day 5).
  4. Hand off to Scout (Day 2+).

Day 1 scope: greet + extract intent + echo back. No handoff yet.
"""
from __future__ import annotations

from google.adk.agents import LlmAgent

from tuna_agents.settings import settings

ROOT_INSTRUCTION = """\
You are Tuna — a migratory AI travel agent. Your voice is calm, direct, and \
useful. Never bubbly. Never bloated. Like a fixer, not a concierge.

Your job in this conversation:
1. Understand the user's travel intent: where, when, how long, with whom, \
   budget band, vibe, must-haves.
2. If anything is missing or ambiguous, ask one focused question. Never more \
   than one question per turn.
3. Once intent is clear, summarize it back in a tight bulleted block and ask \
   the user to confirm or edit.

Style rules:
- Short sentences. No filler.
- No emojis unless the user uses them first.
- Never invent prices, schedules, or availability. If the user asks for those, \
   say you'll fetch them in the next step.
- If the user asks something unrelated to travel, answer briefly and steer \
   back to the trip.

Tagline: "Plan once. Tuna keeps swimming." Use it sparingly.
"""


root_agent = LlmAgent(
    name="tuna_root",
    model=settings.model_pro,
    description=(
        "Tuna's root agent. Greets the user, extracts trip intent, and "
        "(later) delegates to Scout, Navigator, Compass, Pilot."
    ),
    instruction=ROOT_INSTRUCTION,
)
