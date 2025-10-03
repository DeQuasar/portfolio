# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Cloudflare Pages deployment

- The site is generated statically with `pnpm build` and deployed to Cloudflare Pages alongside the `/functions/download/resume.ts` handler, which streams `public/resume.pdf` back to the browser without leaving the portfolio.
- GitHub Actions deploy only when a semver tag is pushed (for example `v1.2.3`) so we avoid burning through Cloudflare's free build quota. The workflow uses the `cloudflare/pages-action` to upload `.output/public` plus the `functions/` directory in one release.
- Make sure the following repository secrets exist before tagging a release: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (scoped to Pages > Edit), and `CLOUDFLARE_PROJECT_NAME` if the action references it.
- Typical release flow:
  1. `pnpm test:ci`
  2. Update `CHANGELOG.md` (if needed) and commit.
  3. `git tag vX.Y.Z`
  4. `git push origin vX.Y.Z`
  The tag push triggers the CI workflow, which builds and publishes the static assets and the download function together.

### Local function testing

Cloudflare's `wrangler pages dev` command can run the static bundle and functions locally:

```bash
pnpm build
wrangler pages dev .output/public --compatibility-date=$(date +%Y-%m-%d)
```

Hit `http://127.0.0.1:8787/download/resume` to verify the streaming response before tagging a release.

## UI regression tests

Run the Vitest-powered suite (including the Playwright UI spec) within a preconfigured container so no local browser tooling is required:

```bash
npm run test:ui:container
```

The command spins up the official Playwright image, installs project dependencies inside an isolated volume, and executes `npm test -- --run`. When you pass custom Vitest flags, include `--run` yourself, for example to execute a single spec:

```bash
npm run test:ui:container -- --run tests/hero-email-tooltip.ui.spec.ts
```

By default the container executes Chromium, Firefox, and WebKit runs so Chrome, Firefox, and Safari engines stay covered. Override with `PLAYWRIGHT_BROWSERS` if you need a narrower slice (for example, `PLAYWRIGHT_BROWSERS=chromium`).
