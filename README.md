# Portfolio (Nuxt 3)

[![CI Audit](https://img.shields.io/github/actions/workflow/status/DeQuasar/portfolio/ci.yml?branch=main&label=CI%20Audit&logo=github)](https://github.com/DeQuasar/portfolio/actions/workflows/ci.yml)
[![Lighthouse](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/DeQuasar/portfolio/main/docs/badges/lighthouse.json)](docs/badges/lighthouse.json)

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
# Native (SPA mode for fast iteration)
pnpm dev

# Full SSR when you need parity with production
pnpm dev:ssr

# Docker (mirrors the SSR flow)
docker compose up app
```

`pnpm dev` now runs Nuxt with `NUXT_SSR=false`, which skips the Nitro server bundle and boots in roughly 1–2 s. Switch to `pnpm dev:ssr` (or `NUXT_SSR=true pnpm dev`) whenever you need to test the full SSR pipeline. Both scripts prune Lighthouse/Playwright artifacts beforehand to keep the file watcher lean. Re-enable Nuxt DevTools ad hoc with `NUXT_DEVTOOLS=1 pnpm dev:ssr` if you need the panel.

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

Container equivalents (mirroring CI). These commands invoke the shared Playwright image and finish by running `scripts/cleanup-playwright-workdir.mjs`, so `.nuxt`, `.output`, `.data`, `reports/`, `.lighthouseci/`, and `test-results/` never linger between runs:

```bash
# Unit tests + coverage (browser specs skipped)
docker compose run --rm coverage

# Full Playwright E2E suite (chromium, firefox, webkit)
pnpm test:ui:container

# Axe accessibility audit
pnpm test:accessibility:container

# Lighthouse performance checks
pnpm test:performance:container
```

Artifacts land in `reports/` and `test-results/` (ignored by git). The cleanup helper above removes them after each containerised run; `pnpm prune:artifacts` is still available if you need to reset things manually before hacking on new tests.

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

`pnpm test:ui:container` drives the Playwright suite (desktop + mobile) with axe audits and Lighthouse pre-flight baked in via `docker-compose.playwright.yml`. Pass `PLAYWRIGHT_BROWSERS=chromium` (or similar) to target a subset locally, though CI pins the multi-browser matrix by default.
