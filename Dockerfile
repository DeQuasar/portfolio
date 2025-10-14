# syntax=docker/dockerfile:1.7
FROM mcr.microsoft.com/playwright:v1.55.1-jammy

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
ENV NUXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

RUN --mount=type=cache,target=/root/.cache/pnpm \
    pnpm install --frozen-lockfile && \
    pnpm rebuild better-sqlite3

COPY docker/app/entrypoint.sh /usr/local/bin/app-entrypoint.sh
RUN chmod +x /usr/local/bin/app-entrypoint.sh

RUN cp /ms-playwright/chromium-*/chrome-linux/chrome_sandbox /usr/local/bin/chrome_sandbox \
    && chown root:root /usr/local/bin/chrome_sandbox \
    && chmod 4755 /usr/local/bin/chrome_sandbox

ENV CHROME_DEVEL_SANDBOX=/usr/local/bin/chrome_sandbox

COPY . .

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "3000"]
ENTRYPOINT ["app-entrypoint.sh"]
