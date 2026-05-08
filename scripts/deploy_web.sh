#!/usr/bin/env bash
# scripts/deploy_web.sh — build and deploy Next.js to Cloud Run
#
# Run from repo root.

set -euo pipefail

PROJECT_ID="${TUNA_PROJECT_ID:-tuna-ai}"
REGION="${TUNA_REGION:-asia-south1}"
SERVICE="tuna-web"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/tuna/${SERVICE}:latest"

echo "→ Building image: ${IMAGE}"
cd web

# Use Cloud Build so we don't need a local Docker daemon
gcloud builds submit \
  --tag "${IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}"

echo
echo "→ Deploying to Cloud Run"
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --service-account "tuna-web@${PROJECT_ID}.iam.gserviceaccount.com" \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 3

URL=$(gcloud run services describe "${SERVICE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format 'value(status.url)')

echo
echo "✓ Web deployed."
echo "  ${URL}"
