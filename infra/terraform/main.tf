terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.40"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ----------------------------------------------------------------------------
# APIs
# ----------------------------------------------------------------------------

locals {
  apis = [
    "aiplatform.googleapis.com",          # Vertex AI + Agent Engine
    "run.googleapis.com",                  # Cloud Run
    "sqladmin.googleapis.com",             # Cloud SQL
    "secretmanager.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "storage.googleapis.com",
    "cloudtrace.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "compute.googleapis.com",              # required for VPC + Cloud SQL private IP
    "servicenetworking.googleapis.com",    # required for Cloud SQL private IP
  ]
}

resource "google_project_service" "apis" {
  for_each           = toset(local.apis)
  service            = each.value
  disable_on_destroy = false
}

# ----------------------------------------------------------------------------
# Networking — minimal VPC for Cloud SQL private IP
# ----------------------------------------------------------------------------

resource "google_compute_network" "vpc" {
  name                    = "tuna-vpc"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.apis]
}

resource "google_compute_subnetwork" "subnet" {
  name          = "tuna-subnet"
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.0.0.0/24"
  private_ip_google_access = true
}

resource "google_compute_global_address" "private_ip_alloc" {
  name          = "tuna-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]
}

# ----------------------------------------------------------------------------
# Cloud SQL Postgres 16 — minimal config, pgvector + postgis
# ----------------------------------------------------------------------------

resource "random_password" "db_password" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "tuna-db-password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

resource "google_sql_database_instance" "tuna" {
  name             = "tuna-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-f1-micro"   # cheapest tier; bump to db-custom-1-3840 for prod
    availability_type = "ZONAL"
    disk_size         = 10
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled    = true            # keep public IP enabled for dev simplicity
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled            = true
      point_in_time_recovery_enabled = true
      start_time         = "03:00"
    }

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }

    insights_config {
      query_insights_enabled = true
    }
  }

  deletion_protection = false   # flip to true after launch
  depends_on = [
    google_service_networking_connection.private_vpc_connection,
  ]
}

resource "google_sql_database" "tuna" {
  name     = "tuna"
  instance = google_sql_database_instance.tuna.name
}

resource "google_sql_user" "app" {
  name     = "tuna-app"
  instance = google_sql_database_instance.tuna.name
  password = random_password.db_password.result
}

# ----------------------------------------------------------------------------
# Cloud Storage — captures, exports, future artifacts
# ----------------------------------------------------------------------------

resource "google_storage_bucket" "artifacts" {
  name                        = "${var.project_id}-artifacts"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.apis]
}

# ----------------------------------------------------------------------------
# Pub/Sub topics — replan loop
# ----------------------------------------------------------------------------

resource "google_pubsub_topic" "currents_tick" {
  name       = "currents.tick"
  depends_on = [google_project_service.apis]
}

resource "google_pubsub_topic" "replan_needed" {
  name       = "replan.needed"
  depends_on = [google_project_service.apis]
}

resource "google_pubsub_topic" "notify_user" {
  name       = "notify.user"
  depends_on = [google_project_service.apis]
}

# ----------------------------------------------------------------------------
# Service accounts
# ----------------------------------------------------------------------------

resource "google_service_account" "agents" {
  account_id   = "tuna-agents"
  display_name = "Tuna Agents (Agent Engine + tools)"
}

resource "google_service_account" "web" {
  account_id   = "tuna-web"
  display_name = "Tuna Web (Cloud Run frontend)"
}

resource "google_service_account" "monitor" {
  account_id   = "tuna-monitor"
  display_name = "Tuna Monitor Worker (Cloud Run job)"
}

# Roles for the agents SA
resource "google_project_iam_member" "agents_aiplatform" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.agents.email}"
}

resource "google_project_iam_member" "agents_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.agents.email}"
}

resource "google_project_iam_member" "agents_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.agents.email}"
}

resource "google_project_iam_member" "agents_storage" {
  project = var.project_id
  role    = "roles/storage.objectUser"
  member  = "serviceAccount:${google_service_account.agents.email}"
}

# Roles for the web SA
resource "google_project_iam_member" "web_aiplatform" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.web.email}"
}

resource "google_project_iam_member" "web_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.web.email}"
}

resource "google_project_iam_member" "web_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.web.email}"
}

# Roles for the monitor SA
resource "google_project_iam_member" "monitor_aiplatform" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.monitor.email}"
}

resource "google_project_iam_member" "monitor_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.monitor.email}"
}

resource "google_project_iam_member" "monitor_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.monitor.email}"
}

# ----------------------------------------------------------------------------
# Artifact Registry for container images
# ----------------------------------------------------------------------------

resource "google_artifact_registry_repository" "containers" {
  location      = var.region
  repository_id = "tuna"
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}
