# Portfolio (Nuxt 3)

Anthony Protano’s portfolio runs on Nuxt 3 with a Cloudflare Pages streaming résumé endpoint, comprehensive Playwright coverage, and Lighthouse performance gates wired into CI.

## Setup

### Native environment

```bash
pnpm install
```

> The repo pins `pnpm@10.17.1` via the `packageManager` field. Run `corepack enable` if pnpm is not already available in your shell.

### Docker workflow

The root `Dockerfile` matches the GitHub Actions environment (Playwright browsers, axe, Lighthouse, pnpm). Install dependencies into the shared container volume once and reuse them everywhere:

```bash
docker compose run --rm app pnpm install
```

All services mount the project directory, a persistent `node_modules` volume, the pnpm store, and the Playwright browser cache so incremental runs stay fast.

## Development server

Start the dev server on `http://localhost:3000`.

```bash
# Native
pnpm dev

# Docker
docker compose up app
```

Stop the containerized server with `Ctrl+C` (or `docker compose down`).

## Production

Generate the static bundle and preview it locally.

```bash
pnpm generate
pnpm preview
```

Container equivalents:

```bash
docker compose run --rm app pnpm generate
docker compose run --rm app pnpm preview -- --host 0.0.0.0 --port 4173
```

## Tests & quality gates

Native commands:

- `pnpm test:coverage` – Vitest with V8 coverage. Browser-backed specs auto-skip unless you export `ENABLE_BROWSER_TESTS=true`.
- `pnpm test:e2e` – Playwright desktop & mobile coverage (generates `.output/public` unless `SKIP_GENERATE=1`).
- `pnpm test:performance` – Lighthouse CI assertions using the desktop preset. On bare metal you’ll need Chrome shared libraries (e.g. `libnspr4`, `libnss3`, `libasound2`); otherwise prefer the Docker variant.

Container equivalents (mirroring CI):

```bash
# Unit tests + coverage (browser specs skipped)
docker compose run --rm coverage

# Full Playwright E2E suite
docker compose run --rm e2e

# Lighthouse performance checks
LOCAL_UID=$(id -u) LOCAL_GID=$(id -g) docker compose run --rm performance
```

Artifacts land in `reports/` and `test-results/` (ignored by git).

If you prune those directories, recreate them before rerunning the containers so Lighthouse can persist its reports:

```bash
mkdir -p reports/lighthouse test-results
```

## Cloudflare Pages deployment

- Tags drive deploys. Push `vX.Y.Z` to ship production; push `vX.Y.Z-preview` to refresh the preview branch (`preview.anthonyprotano.com`) without generating a GitHub Release.
- The workflow in `.github/workflows/deploy-cloudflare.yml` runs `pnpm test:coverage`, Playwright, Lighthouse, and finally deploys `.output/public` plus `functions/` via `cloudflare/pages-action@v1`.
- Required repository secrets: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (Pages > Edit scope), and `CLOUDFLARE_PROJECT_NAME`.
- Typical release flow:
  1. Run the quality gates locally (`pnpm test:coverage`, `pnpm test:e2e`, `pnpm test:performance`).
  2. `git tag vX.Y.Z`
  3. `git push origin vX.Y.Z`

### Preview deployments on a subdomain

- Tags ending in `-preview` deploy the same artifact to the Pages branch named `preview` and skip the Release step.
- Point `preview.anthonyprotano.com` (or your chosen preview domain) at that environment once in the Pages UI; subsequent preview tags reuse it.

### Managing preview access with Terraform

- `infra/terraform/cloudflare` owns the Cloudflare Access application and policies that protect the preview domain.
- Adjust the allow list through `preview_allowed_emails` and re-run `terraform apply`. The Terraform state is local (`terraform.tfstate`) by design; keep it outside version control.

### Local function testing

```bash
pnpm generate
wrangler pages dev .output/public --compatibility-date=$(date +%Y-%m-%d)
```

Then visit `http://127.0.0.1:8787/download/resume` to validate the streaming response.

## UI regression tests

`docker compose run --rm e2e` drives the Playwright suite (desktop + mobile) with axe audits and Lighthouse pre-flight baked in. The legacy helper `pnpm test:ui:container` still maps to `docker-compose.playwright.yml` if you need the standalone Playwright image for Vitest-specific runs.
