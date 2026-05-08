"""Deploy Tuna's root agent to Vertex AI Agent Engine.

Usage:
    python -m tuna_agents.deploy

Reads config from env (TUNA_PROJECT_ID, TUNA_REGION) or .env.
On success, prints the agent_engine_id — paste it back into .env as
TUNA_AGENT_ENGINE_ID for subsequent runs.
"""
from __future__ import annotations

import sys

import vertexai
from vertexai import agent_engines

from tuna_agents.root import root_agent
from tuna_agents.settings import settings


def main() -> int:
    print(f"→ Initializing Vertex AI in {settings.project_id} / {settings.region}")
    vertexai.init(
        project=settings.project_id,
        location=settings.region,
        staging_bucket=f"gs://{settings.project_id}-artifacts",
    )

    print("→ Creating Agent Engine deployment for tuna_root")
    remote_agent = agent_engines.create(
        agent_engine=root_agent,
        display_name="Tuna Root Agent",
        description="Tuna — plan once, keeps swimming.",
        requirements=[
            "google-adk>=1.0.0",
            "google-cloud-aiplatform>=1.71.0",
            "pydantic>=2.7.0",
        ],
        extra_packages=["./tuna_agents"],
    )

    engine_id = remote_agent.resource_name.split("/")[-1]
    print()
    print("✓ Deployed.")
    print(f"  resource_name: {remote_agent.resource_name}")
    print(f"  agent_engine_id: {engine_id}")
    print()
    print("Add this to your .env:")
    print(f"  TUNA_AGENT_ENGINE_ID={engine_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
