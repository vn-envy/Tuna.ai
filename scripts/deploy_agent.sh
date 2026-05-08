#!/usr/bin/env bash
# scripts/deploy_agent.sh — deploy the root agent to Vertex AI Agent Engine
#
# Run from repo root after bootstrap.sh has provisioned infra.

set -euo pipefail

PROJECT_ID="${TUNA_PROJECT_ID:-tuna-ai}"
REGION="${TUNA_REGION:-asia-south1}"

echo "→ Deploying Tuna root agent"
cd agents

# Use uv if available, fall back to venv
if command -v uv >/dev/null 2>&1; then
  uv venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  uv pip install -e ".[dev]"
else
  python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -e ".[dev]"
fi

# Sync top-level .env into the agents dir for settings.py
if [[ -f ../.env ]]; then
  cp ../.env .env
fi

echo
echo "→ Running tests"
pytest -q

echo
echo "→ Deploying to Agent Engine"
python -m tuna_agents.deploy

echo
echo "✓ Agent deployed. Capture TUNA_AGENT_ENGINE_ID from above and add to .env."
echo "  Then smoke-test:"
echo "    python -m tuna_agents.smoke '5 days Lisbon for 2, mid-budget, June'"
