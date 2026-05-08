variable "project_id" {
  description = "GCP project ID (e.g., tuna-ai)"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-south1"
}
