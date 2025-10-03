output "preview_access_application_id" {
  description = "Identifier of the Cloudflare Access application securing the preview environment."
  value       = cloudflare_zero_trust_access_application.portfolio_preview.id
}

output "preview_allow_policy_id" {
  description = "Identifier of the allow-list policy for preview access."
  value       = cloudflare_zero_trust_access_policy.preview_allow.id
}

output "preview_deny_policy_id" {
  description = "Identifier of the fallback deny policy for preview access."
  value       = cloudflare_zero_trust_access_policy.preview_deny.id
}
