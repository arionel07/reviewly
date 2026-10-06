# Reviewly — Product

## What Reviewly is

Reviewly is a SaaS tool for web, design, and development agencies to collect
visual feedback from clients directly on a live website, and to manage the
review/approval workflow around that feedback.

## Target users

- Web agencies
- Design agencies
- Freelance/agency web developers

The people using the agency dashboard are agency members (internal users).
The people leaving feedback through a review link are their clients, who are
not expected to hold Reviewly accounts.

## Core problem

Agencies currently collect client feedback on in-progress websites through
scattered channels — email, screenshots in chat apps, spreadsheets, voice
calls — none of which capture *where on the page* and *on what element* the
feedback applies. This makes feedback slow to act on and easy to lose track
of.

## Core product loop

```
See → Comment → Fix → Review → Approve
```

In practice, spelled out:

1. Agency creates a project.
2. Agency connects a website to that project.
3. Client opens a review link for the project.
4. Client selects an element on the website (via the embedded widget).
5. Client leaves feedback on that element.
6. Reviewly captures contextual information: page URL, selected element,
   viewport, and a screenshot.
7. Agency receives the feedback in the dashboard.
8. Agency fixes the issue and resolves the feedback.
9. Agency requests a project review when no blocking feedback remains.
10. Client reviews the project and either approves the round or requests changes.
11. Agency addresses requested changes and starts another review round.

This loop is central to the product. Features that do not serve it should
not be added without reconsidering scope.

## MVP scope

The MVP includes:

- authentication
- workspaces (Better Auth organizations — see `ARCHITECTURE.md`)
- clients
- projects
- an embeddable website feedback widget
- visual feedback tied to a page URL and element
- feedback comments
- feedback statuses
- client review links
- screenshots and browser/page metadata captured with feedback
- project-level approval review rounds
- simple feedback reopen actions
- in-app notifications for important client activity

## Explicit non-goals

The MVP does **not** include:

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

Out-of-scope features should not be added without an explicit product
decision to expand scope.

## Agency dashboard vs. client portal

Reviewly serves two distinct audiences with two distinct surfaces:

- **Agency dashboard** — for authenticated workspace members. May expose
  projects, feedback, members, settings, and other operational detail.
- **Client portal** — for clients accessing a project through a review link.
  Clients are not required to create an account for ordinary review flows.
  The client portal stays deliberately simple: open review → inspect
  project → leave feedback → review changes → approve or request changes. Internal agency
  complexity (billing, member management, other clients, etc.) is never
  exposed here.

## Feedback lifecycle

A piece of feedback currently moves through these states:

```
open → in_progress → resolved → reopened
```

- `open` — newly submitted, not yet acted on.
- `in_progress` — the agency is actively working on it.
- `resolved` — the agency considers it addressed.
- `reopened` — the client was not satisfied and sent it back.

This is the **feedback workflow** state. Client approval is a related but
separate concern (see "Review links" below and ADR-010 in
`DECISIONS.md`) and is not folded into this enum.

## Website widget role

The widget is the mechanism by which a client selects a concrete element on
the live website and attaches feedback to it, capturing the page URL,
element selector, viewport, and a screenshot as context. It is embedded on
the client's website and must work without assuming control over, or
interfering with, the host page. See `ARCHITECTURE.md` for its technical
constraints.

## Review links

Clients reach a project's review experience through a review access token
(a per-project, revocable, expiring link) rather than through a Reviewly
user account. This keeps the client side of the product free of account
creation friction while still allowing the agency to scope and revoke
access per project.

## Review rounds

Project approval is represented by repeatable `ProjectReview` rows. Each
request creates a new round with `pending`, `changes_requested`, or
`approved` status. Decided rounds are immutable; feedback status and the
project lifecycle remain separate. Review access tokens authorize the
public portal but are not coupled to review-round creation.

## In-app notifications

Important client activity appears inside the authenticated agency application:
new widget feedback, anonymous comments, client reopens, and ProjectReview
decisions. Notifications belong to the workspace, while read state belongs to
each agency user. Email delivery is a separate future transport and is not
part of Notifications Phase 1.

## Future directions (only where already decided)

- Approval invalidation after feedback changes and richer decision metadata
  are not specified yet.
- Workspace membership (via Better Auth organizations) is the foundation
  for eventual multi-member agency accounts; role-based permissions beyond
  Better Auth's defaults are not yet defined.

No other future direction is documented here, to avoid speculating beyond
what has actually been decided.
