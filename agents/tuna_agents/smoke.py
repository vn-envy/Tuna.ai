"""Smoke-test the deployed Tuna root agent.

Usage:
    python -m tuna_agents.smoke "5 days Lisbon for 2, mid-budget, June"
"""
from __future__ import annotations

import sys

import vertexai
from vertexai import agent_engines

from tuna_agents.settings import settings


def main(message: str) -> int:
    if not settings.agent_engine_id:
        print("ERROR: TUNA_AGENT_ENGINE_ID is not set. Run deploy first.")
        return 1

    vertexai.init(project=settings.project_id, location=settings.region)
    remote = agent_engines.get(settings.agent_engine_id)

    print(f"→ Asking Tuna: {message!r}")
    print()

    # ADK on Agent Engine exposes stream_query; just print event chunks.
    for event in remote.stream_query(
        user_id="smoke-user",
        message=message,
    ):
        if isinstance(event, dict):
            content = event.get("content") or {}
            for part in content.get("parts", []):
                text = part.get("text")
                if text:
                    print(text, end="", flush=True)
    print()
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(" ".join(sys.argv[1:])))
