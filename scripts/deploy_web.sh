#!/usr/bin/env bash
# scripts/deploy_web.sh — build and deploy the Next.js frontend to Cloud Run.
#
# Run from repo root. Optional environment variables:
#   TUNA_PROJECT_ID, TUNA_REGION, TUNA_WEB_SERVICE, TUNA_BACKEND_SERVICE
#   TUNA_BACKEND_URL, GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

set -euo pipefail

PROJECT_ID="${TUNA_PROJECT_ID:-tuna-ai}"
REGION="${TUNA_REGION:-asia-south1}"
SERVICE="${TUNA_WEB_SERVICE:-tuna-web}"
BACKEND_SERVICE="${TUNA_BACKEND_SERVICE:-tuna-api}"
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

BACKEND_URL="${TUNA_BACKEND_URL:-}"
if [[ -z "${BACKEND_URL}" ]]; then
  BACKEND_URL="$(lookup_service_url "${BACKEND_SERVICE}")"
fi

MAPS_KEY="${GOOGLE_MAPS_API_KEY:-${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:-}}"
ENV_VARS=()
if [[ -n "${BACKEND_URL}" ]]; then
  ENV_VARS+=("BACKEND_URL=${BACKEND_URL}")
else
  echo "⚠ BACKEND_URL was not supplied and Cloud Run service '${BACKEND_SERVICE}' was not found."
  echo "  Chat will show a deployment hint until BACKEND_URL is set on '${SERVICE}'."
fi

if [[ -n "${MAPS_KEY}" ]]; then
  ENV_VARS+=("GOOGLE_MAPS_API_KEY=${MAPS_KEY}")
else
  echo "⚠ GOOGLE_MAPS_API_KEY was not supplied."
  echo "  MapView will show a configuration hint until GOOGLE_MAPS_API_KEY is set on '${SERVICE}'."
fi

echo "→ Building image: ${IMAGE}"
cd frontend

gcloud builds submit \
  --tag "${IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}"

echo
echo "→ Deploying frontend to Cloud Run"
DEPLOY_ARGS=(
  run deploy "${SERVICE}"
  --image "${IMAGE}"
  --region "${REGION}"
  --project "${PROJECT_ID}"
  --service-account "tuna-web@${PROJECT_ID}.iam.gserviceaccount.com"
  --allow-unauthenticated
  --port 8080
  --cpu 1
  --memory 512Mi
  --min-instances 0
  --max-instances 3
)

if (( ${#ENV_VARS[@]} > 0 )); then
  DEPLOY_ARGS+=(--update-env-vars "$(join_by_comma "${ENV_VARS[@]}")")
fi

gcloud "${DEPLOY_ARGS[@]}"

URL="$(lookup_service_url "${SERVICE}")"

echo
echo "✓ Frontend deployed."
echo "  ${URL}"
if [[ -n "${BACKEND_URL}" ]]; then
  echo "  Chat proxy → ${BACKEND_URL}"
fi
