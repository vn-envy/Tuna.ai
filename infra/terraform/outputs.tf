output "db_connection_name" {
  value       = google_sql_database_instance.tuna.connection_name
  description = "Cloud SQL instance connection name (project:region:instance)"
}

output "db_instance_ip" {
  value       = google_sql_database_instance.tuna.public_ip_address
  description = "Cloud SQL public IP (dev only)"
}

output "db_password_secret" {
  value       = google_secret_manager_secret.db_password.secret_id
  description = "Secret Manager secret holding the db password"
}

output "agents_sa" {
  value = google_service_account.agents.email
}

output "web_sa" {
  value = google_service_account.web.email
}

output "monitor_sa" {
  value = google_service_account.monitor.email
}

output "artifacts_bucket" {
  value = google_storage_bucket.artifacts.name
}

output "artifact_registry" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.containers.repository_id}"
}
