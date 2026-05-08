#!/usr/bin/env bash
# scripts/bootstrap.sh — Day 1 setup
#
# Run from repo root:
#     bash scripts/bootstrap.sh
#
# Idempotent. Safe to re-run.

set -euo pipefail

PROJECT_ID="${TUNA_PROJECT_ID:-tuna-ai}"
REGION="${TUNA_REGION:-asia-south1}"

echo "→ Bootstrapping Tuna in project=${PROJECT_ID} region=${REGION}"
echo

# 0. Confirm gcloud is logged in and pointed at the right project
echo "→ Setting active project"
gcloud config set project "${PROJECT_ID}"

CURRENT_ACCT=$(gcloud config get-value account 2>/dev/null || echo "")
if [[ -z "${CURRENT_ACCT}" ]]; then
  echo "ERROR: Not logged into gcloud. Run: gcloud auth login"
  exit 1
fi
echo "  active account: ${CURRENT_ACCT}"

# 1. Application-default credentials (for Terraform + Python)
echo "→ Ensuring application-default credentials"
if ! gcloud auth application-default print-access-token >/dev/null 2>&1; then
  gcloud auth application-default login
fi

# 2. Terraform
echo
echo "→ Running Terraform"
cd infra/terraform

if [[ ! -f terraform.tfvars ]]; then
  cp terraform.tfvars.example terraform.tfvars
  sed -i.bak "s/tuna-ai/${PROJECT_ID}/" terraform.tfvars && rm -f terraform.tfvars.bak
  sed -i.bak "s/asia-south1/${REGION}/" terraform.tfvars && rm -f terraform.tfvars.bak
  echo "  wrote terraform.tfvars"
fi

terraform init -upgrade
terraform apply -auto-approve

DB_INSTANCE=$(terraform output -raw db_connection_name)
DB_IP=$(terraform output -raw db_instance_ip)
ARTIFACT_REG=$(terraform output -raw artifact_registry)
cd ../..

# 3. Run SQL migrations
echo
echo "→ Running SQL migrations"
DB_PASS=$(gcloud secrets versions access latest --secret=tuna-db-password)
export PGPASSWORD="${DB_PASS}"
for f in infra/sql/migrations/*.sql; do
  echo "  applying $(basename "$f")"
  psql -h "${DB_IP}" -U tuna-app -d tuna -f "$f"
done
unset PGPASSWORD

# 4. Write a top-level .env for local dev
echo
echo "→ Writing .env"
cat > .env <<EOF
TUNA_PROJECT_ID=${PROJECT_ID}
TUNA_REGION=${REGION}
TUNA_DB_INSTANCE=${DB_INSTANCE}
TUNA_DB_NAME=tuna
TUNA_DB_USER=tuna-app
TUNA_DB_PASSWORD_SECRET=tuna-db-password
TUNA_ARTIFACT_REGISTRY=${ARTIFACT_REG}
EOF

echo
echo "✓ Bootstrap complete."
echo
echo "Next:"
echo "  1. Deploy the agent:   bash scripts/deploy_agent.sh"
echo "  2. Deploy the web:     bash scripts/deploy_web.sh"
