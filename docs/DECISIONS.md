# Reviewly — Architecture Decision Log

Lightweight ADR log. Each entry is a decision that has already been made
and reflected in the codebase/configuration, not a proposal.

---

## ADR-001 — Full-stack Next.js monolith instead of a separate backend

**Status:** Accepted

**Context:** Reviewly needs an authenticated agency dashboard, a public
client-facing review portal, and a handful of widget-facing endpoints.
A separate backend service (e.g. a dedicated NestJS API) was a possible
alternative.

**Decision:** Build Reviewly as a single full-stack Next.js application.
Server Components and Server Actions handle the dashboard; Route Handlers
handle the widget API, uploads, and webhooks. No separate backend service
exists or is planned.

**Consequences:** Fewer moving parts to deploy and operate; one codebase,
one deploy target. Internal reads go straight from a Server Component to
Drizzle rather than through an internal HTTP hop. If a genuine scaling or
isolation need ever justifies a separate service, that is a new, explicit
decision — not a default path.

---

## ADR-002 — Bun as package manager/runtime tooling

**Status:** Accepted

**Context:** A single, fast, consistent tool was wanted for installs,
scripts, and local running, instead of mixing npm/yarn/pnpm.

**Decision:** Use Bun exclusively (`bun install`, `bun add`,
`bun run <script>`). `bun.lock` is the only lockfile. npm/yarn/pnpm and
their lockfiles are not used.

**Consequences:** Faster installs/runs; contributors and CI must have Bun
available; any script assuming Node's package manager behavior should be
verified under Bun.

---

## ADR-003 — PostgreSQL + Drizzle instead of Prisma

**Status:** Accepted

**Context:** A relational store and a TypeScript ORM were needed for a
schema with clear foreign-key relationships (organizations, clients,
projects, feedback, comments, tokens).

**Decision:** Use PostgreSQL as the only datastore, and Drizzle ORM
(`drizzle-orm` + `postgres.js`) for schema definition, queries, and
migrations (`drizzle-kit`). Prisma is not used alongside or instead of
Drizzle.

**Consequences:** Schema is defined as plain TypeScript under
`src/db/schema/`, giving direct control over SQL generation and migration
files; no Prisma schema DSL or generated client. Better Auth's Drizzle
adapter is used so the same database and ORM serve both authentication and
business tables.

---

## ADR-004 — Better Auth for authentication

**Status:** Accepted

**Context:** Reviewly needs account creation, session management, and
(see ADR-005) a multi-tenant workspace concept, without building these
from scratch.

**Decision:** Use Better Auth (`better-auth`, with its Drizzle adapter) as
the authentication system, configured in `src/lib/auth/auth.ts` and
exposed through the catch-all Route Handler at
`src/app/api/auth/[...all]/route.ts`. Email/password auth is enabled.

**Consequences:** `user`, `session`, `account`, and `verification` tables
are generated and owned by Better Auth and should not be hand-edited;
schema changes to them go through the Better Auth CLI
(`bunx @better-auth/cli generate`), not manual edits.

---

## ADR-005 — Better Auth Organization represents a Reviewly Workspace

**Status:** Accepted

**Context:** Reviewly is multi-tenant: an agency account (a "workspace")
can have members, clients, and projects. A custom workspace/membership
model was one option; using Better Auth's built-in organization plugin was
another.

**Decision:** Enable Better Auth's `organization` plugin
(`better-auth/plugins/organization`) and use its `organization`, `member`,
and `invitation` tables as the workspace model. A Better Auth
**Organization is a Reviewly Workspace** — there is no separate, custom
`workspace` table. Business tables (`client`, `project`) store
`organizationId` as their tenant key.

**Consequences:** Workspace membership, invitations, and roles reuse
Better Auth's plugin instead of a hand-rolled system. Any future
permission model should extend Better Auth's organization roles rather
than introducing a parallel membership concept.

---

## ADR-006 — Vanilla TypeScript widget instead of React

**Status:** Accepted

**Context:** The embeddable widget runs inside arbitrary third-party
websites, where bundle size, global namespace pollution, and
compatibility with the host page's own React (if any) are real risks.

**Decision:** Build the widget in vanilla TypeScript. It must not bundle
or depend on React.

**Consequences:** Widget code cannot use React component patterns or
hooks; UI is built and torn down with plain DOM APIs. This keeps the
widget bundle small and avoids any risk of colliding with a React
instance already present on the host page.

---

## ADR-007 — Vite as a separate widget build target

**Status:** Accepted

**Context:** The widget has different build requirements than the Next.js
app (library/IIFE output, no server runtime, different entry point) and
needs to be embeddable as a single script tag.

**Decision:** Build the widget with its own Vite config
(`vite.widget.config.ts`), compiling `src/widget/index.ts` to a single
IIFE bundle (`public/widget/widget.js`), independent of the Next.js build
pipeline (`widget:build` / `widget:watch` scripts). The widget source
lives in the same repository (`src/widget/`) but is not part of the
Next.js build graph.

**Consequences:** Two build tools exist in the repository (Next.js's own
bundler for the app, Vite for the widget); they are intentionally
decoupled so that the widget's output stays a small, standalone script.

---

## ADR-008 — Shadow DOM for widget UI isolation

**Status:** Accepted

**Context:** The widget renders its own UI (inspect mode, feedback
composer) on top of an arbitrary host page whose CSS and DOM it does not
control.

**Decision:** The widget's UI is isolated using Shadow DOM, so host-page
CSS cannot leak into the widget and the widget's own styles cannot leak
onto the host page.

**Consequences:** Widget components are built and styled inside the shadow
root, keeping host-page styles isolated from the widget UI.

---

## ADR-009 — Review access tokens stored hashed, not plaintext

**Status:** Accepted

**Context:** Review access tokens grant an unauthenticated client access
to a project's review portal. Storing them as plaintext would mean a
database read (via compromise, backup leak, or an overly broad query)
directly yields usable client-access credentials.

**Decision:** The `review_access_token` table stores only `tokenHash` (a
SHA-256 hash), never the raw token. The raw token is generated, returned
to the caller once (e.g. embedded in the review link), and discarded
server-side; only its hash is persisted and uniquely indexed.

**Consequences:** Verifying a presented token requires hashing the
incoming value and looking it up by hash rather than comparing raw
strings. A lost/leaked database backup does not expose usable tokens.
The current portal revalidates the token on every public mutation; generated
tokens have no default expiry and can be disabled by revocation.

---

## ADR-010 — Feedback workflow separated from approval/review state

**Status:** Accepted

**Context:** The product loop distinguishes "the agency is working the
issue" from "the client is satisfied with the result." An earlier version
of the schema mixed an `approved` value into the feedback status enum,
conflating these two concerns into one column.

**Decision:** `feedback.status` (the `feedback_status` enum) represents
only the work-item workflow: `open → in_progress → resolved → reopened`.
Client approval is treated as a separate concern that is not represented
as a `feedback` column today. Project approval is modeled by the separate
ProjectReview entity documented in ADR-011.

**Consequences:** `reopened` remains the mechanism by which client
dissatisfaction with a specific item feeds back into the workflow, while
ProjectReview records project-level acceptance separately.

---

## ADR-011 — ProjectReview stores repeatable project-level review rounds

**Status:** Accepted

**Context:** Client approval applies to a project revision, not to one
feedback item. A project may be reviewed more than once, and prior decisions
must remain historically true.

**Decision:** Store each agency Request review action as a new `ProjectReview`
row. Its status is `pending`, `changes_requested`, or `approved`. A partial
unique index allows no more than one pending round per project. Once decided,
a round is immutable; a later request creates another row.

`Project.status` remains the project lifecycle, `Feedback.status` remains the
issue workflow, and `ReviewAccessToken` remains only the public authorization
credential. Review decisions do not automatically mutate feedback or the
project lifecycle.

**Consequences:** Review history is queryable without reconstructing state
from mutable project fields. The client can approve or request changes only
through a valid project-scoped review token, while agency request actions are
tenant-scoped. Future policy such as approval invalidation after later
feedback changes is intentionally not part of Phase 1.

---

## ADR-012 — Workspace notifications with per-user read state

**Status:** Accepted

**Context:** Client activity must be visible to agency members without making
email delivery part of the Notifications Phase 1 persistence model. Realtime
delivery, recipient routing, and a generic event bus were also out of scope.
A single read flag on a workspace notification would incorrectly mark
the item read for every member.

**Decision:** Store notifications as workspace-scoped historical records.
Store read state separately in `notification_read`, keyed by
`(notificationId, userId)`. Any workspace member can see recent activity, and
each member's unread state is computed by the absence of their read marker.
Mutation boundaries create notifications transactionally after the domain
mutation succeeds. The header bell loads a bounded recent list and unread
count through organization-scoped queries.

Notifications remain in-app only in Phase 1. Email is a separate future
transport and no notification preferences, retention, deletion, or realtime
delivery are introduced.

---

## ADR-013 — Review request owns current-link rotation and best-effort email

**Status:** Accepted

**Context:** A client must receive the raw review URL at the moment an agency
requests a review, while the database must never store that raw credential.
Keeping manual link creation and review requests independent would also allow
multiple active links for one project.

**Decision:** Request review atomically revokes active project tokens, creates
one new hashed token, and creates the pending `ProjectReview`. The raw token is
then used only in memory to construct the canonical `APP_URL/r/<token>` link
for Resend and the one-time agency UI result. Manual link creation and
resending a pending link use the same rotation rule; resending never creates a
new review round. The review-link expiry policy remains unchanged and no new
default expiry is introduced.

**Consequences:** At most one current active review link is intended for a
project. A failed email does not invalidate the newly created review or token;
the UI reports the failure and offers a fresh-token resend. Because the raw
URL is not recoverable from storage, a resend necessarily invalidates the
previous link.

---

## ADR-014 — Transactional email is best-effort after commit

**Status:** Accepted

**Context:** Resend is external I/O and cannot participate atomically in the
PostgreSQL transaction that owns review state and in-app notifications.

**Decision:** Commit review/token/notification mutations first, then call the
focused Resend + React Email boundary. Missing configuration, missing client
email, and provider failures are represented as delivery results; provider
failures are logged with Pino using only event, project, and organization
context. Workspace decision recipients are resolved from current members at
send time and deduplicated; no recipient or provider message is persisted.

**Consequences:** Business state and in-app notifications remain reliable even
when email delivery fails. There is a small accepted crash window between DB
commit and the provider call because Phase 2 intentionally has no outbox,
background queue, automatic retry, webhook processing, or delivery tracking.
