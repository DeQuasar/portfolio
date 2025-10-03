# Cloudflare Access Terraform configuration

This Terraform module manages the Cloudflare Access application that protects the preview deployment (`preview.anthonyprotano.com`).

## Prerequisites

- Terraform 1.6 or newer
- Cloudflare Terraform provider 5.x (installed automatically on `terraform init`)
- Cloudflare API token with the following permissions:
  - **Access: Apps – Edit**
  - **Access: Policies – Edit**
- `TF_VAR_cloudflare_account_id` or a `terraform.tfvars` entry containing your Cloudflare account ID (`6cf53ee0e2e25f55dfd57201263e5d9c`).
- Provide the API token to Terraform via either:
  - Environment variable `CLOUDFLARE_API_TOKEN`, or
  - `TF_VAR_cloudflare_api_token` (not recommended for shared shells).

## Bootstrapping existing resources

The Access application and policies already exist in Cloudflare. Import them before running `terraform apply` so Terraform takes ownership:

```bash
cd infra/terraform/cloudflare
terraform init
terraform import cloudflare_zero_trust_access_application.portfolio_preview accounts/6cf53ee0e2e25f55dfd57201263e5d9c/034fe616-da9c-46a2-8b43-a24c70f026f3
```

After importing, run `terraform plan` to confirm Terraform’s view matches what is currently deployed. The embedded policies are managed through the Access application definition, so no additional imports are necessary.

## Updating the allow list

Edit `preview_allowed_emails` in `variables.tf` (or override it via `tfvars`) to add or remove authorized preview reviewers. Apply the configuration:

```bash
terraform plan
terraform apply
```

Terraform will update the allow/deny policies automatically while keeping the fallback deny rule in place.

## Outputs

- `preview_access_application_id` – Access application ID
- `preview_allow_policy_id` – Allow-list policy ID
- `preview_deny_policy_id` – Fallback deny policy ID

These help confirm the resources under management or can feed other infrastructure.
