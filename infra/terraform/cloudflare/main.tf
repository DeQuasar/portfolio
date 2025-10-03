provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_zero_trust_access_policy" "preview_allow" {
  account_id = var.cloudflare_account_id
  name       = "Portfolio Preview allow list"
  decision   = "allow"

  include = [
    for email in var.preview_allowed_emails : {
      email = {
        email = email
      }
    }
  ]
}

resource "cloudflare_zero_trust_access_policy" "preview_deny" {
  account_id = var.cloudflare_account_id
  name       = "Portfolio Preview deny fallback"
  decision   = "deny"

  include = [
    {
      everyone = {}
    }
  ]
}

resource "cloudflare_zero_trust_access_application" "portfolio_preview" {
  account_id                = var.cloudflare_account_id
  name                      = "Portfolio Preview"
  domain                    = var.preview_domain
  type                      = "self_hosted"
  session_duration          = var.preview_session_duration
  auto_redirect_to_identity = true

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.preview_allow.id
      precedence = 1
    },
    {
      id         = cloudflare_zero_trust_access_policy.preview_deny.id
      precedence = 2
    }
  ]
}
