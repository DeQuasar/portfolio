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
