# Reviewly — Agent Instructions

## Project

Reviewly is a SaaS for web, design, and development agencies to collect visual
client feedback directly on websites and manage the review/approval workflow.

Core product loop:

1. Agency creates a project.
2. Agency connects a website.
3. Client opens a review link.
4. Client selects an element on the website.
5. Client leaves feedback.
6. Reviewly captures contextual information such as URL, selected element,
   viewport, and screenshot.
7. Agency receives the feedback in the dashboard.
8. Agency resolves the feedback.
9. Client reviews the change and can approve or reopen it.

Keep this workflow central to product and engineering decisions.

Do not turn Reviewly into a generic project-management system.

---

## Current Product Scope

The MVP includes:

- authentication
- workspaces / organizations
- clients
- projects
- embeddable website feedback widget
- visual feedback
- feedback comments
- feedback statuses
- client review links
- screenshots and browser/page metadata
- simple approvals
- email notifications

The MVP explicitly does NOT include:

- CRM
- invoices
- contracts
- time tracking
- kanban boards
- sprint management
- team chat
- AI features
- mobile applications
- Figma integration
- Jira integration
- Linear integration
- automation builders
- complex billing logic

Do not add out-of-scope features unless explicitly requested.

---

## Architecture

Reviewly is currently a full-stack Next.js monolith.

Do not introduce a separate backend service such as NestJS unless explicitly
requested.

Primary architecture:

- Next.js App Router for the web application
- Server Components by default
- Server Actions for internal application mutations where appropriate
- Route Handlers for external HTTP APIs, widget endpoints, webhooks, uploads,
  and integrations
- PostgreSQL as the primary database
- Drizzle ORM for database access
- Better Auth for authentication
- Vanilla TypeScript widget built separately with Vite

The widget is part of the same repository but is an independent browser bundle.

---

## Technology Stack

Runtime and package manager:

- Bun

Application:

- Next.js 16
- React
- TypeScript
- App Router

Styling and UI:

- Tailwind CSS v4
- shadcn/ui
- Base UI primitives

Data:

- PostgreSQL
- Drizzle ORM
- postgres.js

Authentication:

- Better Auth

Validation and forms:

- Zod
- React Hook Form

Widget:

- Vanilla TypeScript
- Vite
- Shadow DOM
- html2canvas initially for screenshots

Storage:

- Cloudflare R2
- S3-compatible API

Email:

- Resend
- React Email

Testing:

- Vitest
- Playwright

Logging:

- Pino

Do not introduce competing libraries without a clear technical reason.

Examples:

- do not add Prisma alongside Drizzle
- do not add Clerk alongside Better Auth
- do not add another CSS framework alongside Tailwind
- do not add another package manager
- do not add React to the widget without explicit approval

---

## Repository Structure

Expected high-level structure:

```text
src/
├── app/
├── components/
├── db/
│   ├── schema/
│   ├── queries/
│   └── index.ts
├── lib/
│   ├── auth/
│   ├── clients/
│   ├── projects/
│   ├── feedback/
│   ├── storage/
│   ├── email/
│   └── validation/
├── emails/
└── widget/
```

Before creating a new folder or architectural layer, inspect the existing
structure and reuse established patterns where possible.

---

## Package Manager

Use Bun exclusively.

Correct commands:

```bash
bun install
bun add <package>
bun add -d <package>
bun run <script>
bunx <package>
```

Do not use:

```bash
npm
npx
pnpm
yarn
```

Do not create npm, pnpm, or yarn lock files.

The repository should use:

```text
bun.lock
```

---

## Next.js Rules

Prefer Server Components.

Only use `"use client"` when browser APIs, local interactive state, React hooks,
or client-side libraries require it.

Do not convert large component trees into Client Components unnecessarily.

Prefer direct server-side database reads for server-rendered pages instead of
calling internal HTTP endpoints.

Example preferred flow:

```text
Server Component
→ domain/query function
→ Drizzle
→ PostgreSQL
```

Do not do this unnecessarily:

```text
Server Component
→ fetch("/api/...")
→ Route Handler
→ Drizzle
```

Use Server Actions for internal mutations when appropriate.

Use Route Handlers for:

- widget API
- external clients
- webhooks
- uploads
- third-party integrations

---

## Domain Logic

Keep business logic out of React components when it becomes non-trivial.

Prefer:

```text
UI
→ action / route handler
→ domain/service function
→ database
```

Shared business rules should live in domain-oriented modules under `src/lib`.

Examples:

```text
src/lib/projects/
src/lib/feedback/
src/lib/clients/
```

Do not create abstractions merely for architectural aesthetics.

Extract logic when it improves reuse, testability, or clarity.

---

## Database Rules

Use Drizzle ORM.

Database schemas live under:

```text
src/db/schema/
```

Export schemas through:

```text
src/db/schema/index.ts
```

Use:

- foreign keys
- deliberate delete behavior
- indexes for real query patterns
- enums where the state space is stable
- timestamps
- explicit constraints

Avoid storing structured relational data in JSON unless there is a clear reason.

Do not modify Better Auth generated tables casually.

Inspect generated auth schema before extending or referencing it.

Schema changes must be followed by:

```bash
bun run db:generate
bun run db:migrate
```

Never silently edit an already-applied migration unless explicitly requested.

---

## Authentication and Authorization

Better Auth is the authentication system.

The Better Auth organization concept represents a Reviewly workspace.

Authorization must always be enforced server-side.

Never rely solely on hidden buttons or client-side checks.

For workspace-scoped resources, verify that the current user belongs to the
relevant workspace before reading or mutating data.

Client review links are different from authenticated workspace users.

Clients should not be forced to create accounts for ordinary review flows unless
the product requirements change.

---

## Widget Architecture

The widget must remain independent from the React/Next.js application runtime.

Do not bundle React into the widget.

The widget should use:

- Vanilla TypeScript
- Vite
- Shadow DOM for UI isolation

Primary widget lifecycle:

```text
initialize
→ load configuration
→ render trigger
→ enter inspect mode
→ hover/select DOM element
→ capture context
→ open feedback composer
→ submit feedback
```

The widget must not assume control over the host website.

Be careful with:

- global CSS
- event propagation
- z-index
- scrolling
- fixed elements
- iframes
- cross-origin resources
- CSP
- CORS
- mobile viewport behavior

Prefer cleanup-friendly APIs.

Listeners and DOM nodes created by the widget should be removable.

---

## Widget Security

Treat the widget as an untrusted public client.

Never expose secrets in widget JavaScript.

Public project keys may identify projects but must not grant administrative
access.

External widget endpoints should validate:

- project key
- project state
- origin/domain where applicable
- payload using Zod
- upload size
- rate limits

Do not trust metadata supplied by the browser without validation.

---

## Validation

Use Zod at trust boundaries.

Validate:

- forms
- Route Handler bodies
- query parameters
- widget requests
- environment variables
- webhook payloads where applicable

Do not duplicate validation schemas unnecessarily.

Reuse schemas between compatible layers when that improves consistency.

---

## UI Principles

Reviewly should feel like a polished professional SaaS.

Visual direction:

- Linear-like clarity
- restrained UI
- high information density without clutter
- strong typography
- subtle borders
- minimal decorative elements
- consistent spacing
- dark and light themes should be supported cleanly through design tokens

Use existing shadcn components as foundations and customize them when necessary.

Do not make the application look like an untouched shadcn demo.

---

## Client Portal Principles

The agency dashboard and client experience serve different users.

The dashboard may expose:

- projects
- feedback
- members
- settings
- operational metadata

The client portal should remain extremely simple.

Primary client flow:

```text
Open review
→ inspect project
→ leave feedback
→ review changes
→ approve
```

Do not expose internal agency complexity to clients unnecessarily.

---

## Testing

Tests are part of implementation, not a later cleanup step.

Use Vitest for:

- domain logic
- utilities
- validation
- permissions
- token logic

Use Playwright for critical end-to-end workflows.

Important eventual E2E flow:

```text
load test website
→ load Reviewly widget
→ select DOM element
→ write feedback
→ submit
→ open Reviewly dashboard
→ verify feedback exists
```

When changing important behavior, add or update relevant tests.

---

## Engineering Workflow

Before implementing a task:

1. Inspect relevant existing files.
2. Understand existing conventions.
3. Identify the smallest change that satisfies the requirement.
4. Avoid unrelated refactors.

During implementation:

- preserve existing architecture unless the task requires changing it
- avoid speculative features
- avoid unnecessary dependencies
- keep changes focused

After implementation:

1. Run relevant tests.
2. Run type checking if configured.
3. Run lint when relevant.
4. Run build for changes that may affect compilation or bundling.
5. For database changes, run Drizzle generation and migrations as appropriate.
6. Review changed files for accidental modifications.

Report:

- what changed
- important architectural decisions
- tests/checks executed
- any remaining limitations

---

## Git Safety

Do not:

- force push
- reset unrelated user changes
- delete unrelated files
- rewrite existing commits
- discard work you did not create

Inspect `git status` before broad modifications.

If unrelated changes already exist, preserve them.

Do not create commits unless explicitly requested.

---

## Decision-Making

Prefer the simplest architecture that satisfies current requirements.

Do not optimize for hypothetical scale before there is evidence it is needed.

Prefer:

```text
simple monolith
```

over:

```text
microservices
```

until actual constraints justify separation.

Prefer:

```text
PostgreSQL
```

before adding specialized infrastructure.

Prefer:

```text
Server Components
```

before adding client-side state management.

Prefer:

```text
existing dependency
```

before introducing a competing library.

When multiple solutions are reasonable, consider:

1. correctness
2. maintainability
3. simplicity
4. testability
5. future migration cost

---

## Documentation

Important product and architectural knowledge should live under:

```text
docs/
```

Expected documents:

```text
docs/PRODUCT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/DECISIONS.md
```

`AGENTS.md` is the operating contract and map, not the complete product
specification.

When a major architectural decision changes, update the relevant documentation.

Do not allow documentation and implementation to knowingly diverge.

---

## Primary Principle

Reviewly's core loop is:

```text
See
→ Comment
→ Fix
→ Review
→ Approve
```

When considering a feature or architectural decision, preserve and improve this
loop rather than expanding the product horizontally without a clear reason.
