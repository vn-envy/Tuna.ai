#!/usr/bin/env bash
# scripts/deploy_backend.sh — build and deploy the FastAPI backend to Cloud Run.
#
# Run from repo root. Optional environment variables:
#   TUNA_PROJECT_ID, TUNA_REGION, TUNA_BACKEND_SERVICE, TUNA_WEB_SERVICE
#   API_AUTH_TOKEN, GOOGLE_API_KEY, ALLOWED_ORIGINS

set -euo pipefail

PROJECT_ID="${TUNA_PROJECT_ID:-tuna-ai}"
REGION="${TUNA_REGION:-asia-south1}"
SERVICE="${TUNA_BACKEND_SERVICE:-tuna-api}"
WEB_SERVICE="${TUNA_WEB_SERVICE:-tuna-web}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/tuna/${SERVICE}:latest"

join_by_comma() {
  local IFS=,
  echo "$*"
}

lookup_service_url() {
  local service_name="$1"
  gcloud run services describe "${service_name}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --format 'value(status.url)' 2>/dev/null || true
}

WEB_URL="$(lookup_service_url "${WEB_SERVICE}")"
CORS_ORIGINS="${ALLOWED_ORIGINS:-${WEB_URL:-http://localhost:3000}}"

ENV_VARS=("ALLOWED_ORIGINS=${CORS_ORIGINS}")
if [[ -n "${API_AUTH_TOKEN:-}" ]]; then
  ENV_VARS+=("API_AUTH_TOKEN=${API_AUTH_TOKEN}")
fi
if [[ -n "${GOOGLE_API_KEY:-}" ]]; then
  ENV_VARS+=("GOOGLE_API_KEY=${GOOGLE_API_KEY}")
fi

echo "→ Building image: ${IMAGE}"
cd backend

gcloud builds submit \
  --tag "${IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}"

echo
echo "→ Deploying backend to Cloud Run"
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 3 \
  --update-env-vars "$(join_by_comma "${ENV_VARS[@]}")"

URL="$(lookup_service_url "${SERVICE}")"

echo
echo "✓ Backend deployed."
echo "  ${URL}"
echo "  Set TUNA_BACKEND_URL=${URL} before running scripts/deploy_web.sh if auto-discovery is unavailable."
