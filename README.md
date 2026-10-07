# Reviewly

Reviewly is a Next.js monolith for collecting visual website feedback and
managing client review and approval rounds. The application includes the
authenticated agency dashboard, a token-scoped client portal, a vanilla
TypeScript widget, PostgreSQL/Drizzle persistence, private Cloudflare R2
screenshots, and best-effort Resend email delivery.

## Local setup

Reviewly uses Bun and PostgreSQL. Copy `.env.example` to `.env` and fill in
the required authentication and database values. R2 and Resend variables are
only needed for those integrations.

The repository includes a Docker Compose PostgreSQL service for development:

```bash
docker compose up -d postgres
bun install
bun run db:migrate
bun run dev
```

Open <http://localhost:3000>.

## Checks

```bash
bun run lint
bun run test:run
bun run test:e2e
bun run build
bun run widget:build
```

Database-backed tests require a separate test `DATABASE_URL`; do not point
automated tests at a development database containing manual data. Playwright
uses one worker for the existing shared Next.js dev-server stability decision.

## Repository guidance

Read [AGENTS.md](AGENTS.md) before making changes. Product and technical
decisions are documented in [docs/PRODUCT.md](docs/PRODUCT.md),
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md),
[docs/DATABASE.md](docs/DATABASE.md), and
[docs/DECISIONS.md](docs/DECISIONS.md).
