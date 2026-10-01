# Claude Code Instructions

The canonical project instructions are in:

```text
AGENTS.md
```

Read `AGENTS.md` before making changes.

Also consult relevant documentation under:

```text
docs/
```

especially:

```text
docs/PRODUCT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/DECISIONS.md
```

## Claude-specific working rules

Before modifying code:

1. Inspect the relevant existing implementation.
2. Read nearby files to understand local conventions.
3. Check `git status`.
4. Do not assume the repository matches generic Next.js conventions when the
   code can be inspected directly.

For non-trivial tasks, reason through dependencies and affected flows before
editing.

Keep implementation scope tightly aligned with the requested task.

Do not:

- redesign unrelated parts of the system
- replace established libraries without explicit justification
- introduce speculative abstractions
- silently add product features
- convert the architecture away from the Next.js monolith
- add a separate backend unless explicitly requested

After modifications, run the checks relevant to the files changed.

Typical commands:

```bash
bun run lint
bun run test:run
bun run build
bun run test:e2e
```

For database work:

```bash
bun run db:generate
bun run db:migrate
```

For widget work:

```bash
bun run widget:build
```

At completion, provide a concise summary containing:

- changed files
- implemented behavior
- checks executed
- important decisions
- unresolved issues, if any

If instructions in this file conflict with `AGENTS.md`, treat `AGENTS.md` as the
canonical project-level source unless the current user request explicitly
overrides it.
