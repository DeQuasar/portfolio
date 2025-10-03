output "preview_access_application_id" {
  description = "Identifier of the Cloudflare Access application securing the preview environment."
  value       = cloudflare_zero_trust_access_application.portfolio_preview.id
}

output "preview_access_policy_names" {
  description = "Names of the policies applied to the preview Access application in precedence order."
  value       = [for policy in cloudflare_zero_trust_access_application.portfolio_preview.policies : policy.name]
}
