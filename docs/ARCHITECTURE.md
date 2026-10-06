# Reviewly — Architecture

## Summary

Reviewly is a single full-stack Next.js monolith. There is no separate
backend service. The embeddable website widget is built from the same
repository but is a separate, independently bundled artifact.

```
                      ┌─────────────────────────────┐
                      │      Next.js monolith        │
                      │   (App Router, Server         │
                      │    Components, Route           │
                      │    Handlers, Server Actions)   │
                      └───────────────┬───────────────┘
                                      │ Drizzle ORM
                                      ▼
                              ┌───────────────┐
                              │  PostgreSQL     │
                              └───────────────┘

              ┌──────────────────────────────────────┐
              │     Widget (Vanilla TS + Vite)         │
              │   embedded on the client's website     │
              └──────────────────┬──────────────────────┘
                                 │ HTTP (Route Handlers)
                                 ▼
                      back into the Next.js monolith
```

## Runtime and tooling

- **Bun** is the runtime and package manager (`bun install`, `bun add`,
  `bun run <script>`). npm/yarn/pnpm and their lockfiles are not used.
- **Next.js 16**, App Router, TypeScript.
- **PostgreSQL** is the primary (and only) datastore. There is no
  secondary database, cache layer, queue, or Redis instance.
- **Drizzle ORM** (`drizzle-orm` + `postgres.js`) for all database access.
  Schema lives under `src/db/schema/`, re-exported from
  `src/db/schema/index.ts`, and migrations are generated with
  `drizzle-kit` into `drizzle/`.
- **Better Auth** is the authentication system. A Better Auth
  **Organization represents a Reviewly Workspace** — there is no separate,
  custom workspace table (see `DATABASE.md` and ADR-005 in
  `DECISIONS.md`).

## Rendering and mutation model

- **Server Components by default.** `"use client"` is only added where
  browser APIs, local interactive state, hooks, or client-side libraries
  require it.
- **Server Actions** are used for internal application mutations
  (dashboard CRUD-style operations performed by an authenticated workspace
  member).
- **Route Handlers** (`src/app/api/**`) are used for anything that is not
  an internal Next.js mutation:
  - the widget's public API (feedback submission, project key
    verification)
  - external/third-party integrations
  - uploads
  - webhooks
  - any endpoint the embeddable widget or an unauthenticated client needs
    to call over plain HTTP

  The repository also contains widget upload/feedback Route Handlers. The
  client review portal uses server-rendered `/r/[token]` routes and Server
  Actions; it does not introduce a separate public API or client session.

- Server-rendered pages read the database directly through
  domain/query functions backed by Drizzle, rather than calling the app's
  own HTTP API internally:

  ```
  Server Component → domain/query function → Drizzle → PostgreSQL
  ```

  not:

  ```
  Server Component → fetch("/api/...") → Route Handler → Drizzle → PostgreSQL
  ```

## The widget

- Built separately with **Vite**, from `src/widget/index.ts`, configured in
  `vite.widget.config.ts`. It bundles to a standalone IIFE
  (`public/widget/widget.js`) via the `widget:build` / `widget:watch`
  scripts, independent of the Next.js build.
- Written in **vanilla TypeScript** — it must not bundle or depend on
  React, so it stays lightweight and decoupled from the app's rendering
  runtime.
- Uses **Shadow DOM** to isolate its own UI from the host page's styles and
  DOM, and `html2canvas` for in-browser screenshots.
- Treated as an untrusted public client: it only carries a public project
  key (which identifies a project but grants no administrative access),
  and any endpoint it talks to must independently validate the project
  key/state, origin, payload shape (Zod), upload size, and rate limits.

**Current implementation state:** the widget supports Shadow DOM UI,
element selection, feedback composition, screenshot capture, presigned R2
uploads, and feedback submission. The widget bundle is built separately
from the Next.js application.

## Storage and outbound services

- **Cloudflare R2** (S3-compatible) stores private feedback screenshots,
  accessed via `@aws-sdk/client-s3` and
  `@aws-sdk/s3-request-presigner`. The application stores object keys and
  signs short-lived URLs only after access checks.
- **Resend** + **React Email** are the decided stack for transactional
  email (e.g. feedback notifications). Both are dependencies; no email
  sending code exists yet.
- **Pino** is the decided logging library. No application logging code
  exists yet.

## Validation

**Zod** is used at trust boundaries: forms, Route Handler bodies, query
parameters, widget requests, environment variables, and webhook payloads.
Schemas are reused between layers where that improves consistency rather
than being duplicated.

## Testing

- **Vitest** for domain logic, utilities, validation, permissions, and
  token logic.
- **Playwright** for critical end-to-end workflows, in particular the
  widget → feedback → dashboard loop.

Vitest and Playwright cover domain logic, database scoping, widget flows,
review tokens, the client review portal, and project review rounds.

## Explicitly out of scope

- No separate backend service (e.g. NestJS).
- No microservices.
- No message queue or background job infrastructure.
- No Redis or other cache layer.
- No realtime infrastructure (websockets, SSE push, etc.).

These are not planned additions; if a future requirement needs one of
these, it should be an explicit, separately justified decision (see
`DECISIONS.md`), not an incidental addition.

## Request / data flow

### 1. Authenticated dashboard flow

```
Agency member's browser
      │  (session cookie, managed by Better Auth)
      ▼
Next.js App Router (Server Component)
      │  reads auth session → resolves active organization (workspace)
      ▼
domain/query function (src/lib/<domain>)
      │  scopes query by organizationId
      ▼
Drizzle ORM
      ▼
PostgreSQL
      │
      ▼ (rendered HTML back to the browser)

Mutations from the dashboard go through a Server Action instead of the
read path above:

Agency member's browser
      │  form submission
      ▼
Server Action
      │  validates input (Zod), re-checks organization membership
      ▼
domain/service function → Drizzle → PostgreSQL
```

Authorization is always re-checked server-side (session → organization
membership → resource ownership by `organizationId`), never inferred from
hidden UI state.

### 2. Widget feedback submission flow

```
Client's browser, on the agency's website
      │  Reviewly widget (Shadow DOM, vanilla TS) is embedded on the page
      ▼
Client enters inspect mode → selects a DOM element → writes feedback
      │  widget captures: page URL, element selector, viewport, screenshot
      ▼
HTTP request to a Route Handler (public project key attached)
      │  Route Handler validates: project key, project state, origin,
      │  payload (Zod), upload size, rate limit
      ▼
domain/service function → Drizzle → PostgreSQL
      │  (screenshot uploaded to Cloudflare R2; URL stored on the Feedback row)
      ▼
Feedback row created, scoped to the project (and transitively the
project's organization)
```

The widget never authenticates as a Reviewly user; the public project key
identifies the project only.

### 3. Client review-link flow

```
Client opens a review link containing a review access token
      │
      ▼
Route Handler / server-rendered route validates the token:
      - looked up by its hash (the raw token is never stored)
      - not expired, not revoked
      - resolves to a project
      ▼
Client portal renders that project's feedback (read) and lets the client
leave comments / approve / reopen existing feedback (write)
      │
      ▼
domain/service function → Drizzle → PostgreSQL
```

The client never holds a Better Auth session; access is entirely scoped by
the possession of a valid, unexpired, unrevoked review access token for
that specific project.

### 4. In-app notification flow

Client-originated mutations create a historical notification in the same
database transaction as the successful domain mutation. Notifications are
scoped to the workspace, not to a recipient user. A separate
`notification_read` row records each user's read state, so one agency member
reading an item does not mark it read for everyone else. The authenticated
layout loads recent notifications and the current user's unread count for the
header bell.
