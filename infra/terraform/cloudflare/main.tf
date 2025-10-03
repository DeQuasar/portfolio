locals {
  preview_allow_includes = [
    for email in var.preview_allowed_emails : {
      email = {
        email = email
      }
    }
  ]
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_zero_trust_access_application" "portfolio_preview" {
  account_id                = var.cloudflare_account_id
  name                      = "Portfolio Preview"
  domain                    = var.preview_domain
  type                      = "self_hosted"
  session_duration          = var.preview_session_duration
  auto_redirect_to_identity = true
  app_launcher_visible      = true

  policies = [
    {
      name       = "Portfolio Preview allow list"
      decision   = "allow"
      precedence = 1
      include    = local.preview_allow_includes
    },
    {
      name       = "Portfolio Preview deny fallback"
      decision   = "deny"
      precedence = 2
      include = [
        {
          everyone = {}
        }
      ]
    }
  ]
}
