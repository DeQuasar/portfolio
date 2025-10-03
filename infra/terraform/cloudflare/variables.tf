variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token with Access Apps and Policies edit permissions. Leave unset to use CLOUDFLARE_API_TOKEN from the environment."
  sensitive   = true
  default     = null
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account identifier that owns the Pages project and Access policies."
}

variable "preview_domain" {
  type        = string
  description = "FQDN serving the preview Pages environment that should be protected by Cloudflare Access."
  default     = "preview.anthonyprotano.com"
}

variable "preview_session_duration" {
  type        = string
  description = "Length of the Cloudflare Access session before re-authentication is required."
  default     = "24h"
}

variable "preview_allowed_emails" {
  type        = list(string)
  description = "Email addresses that are allowed to view the preview environment."
  default = [
    "tonypro999@gmail.com"
  ]
}
