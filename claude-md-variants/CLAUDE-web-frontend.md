# kifiya-ui — web frontend variant

Extends `CLAUDE.md` for web frontends. Copied into a repo and filled by the adoption flow (`ADOPT.md` in the golden template) — verified facts from the code, `<TODO: …>` for the rest — then kept current by the team. `CLAUDE.md` itself stays generic. Nothing here overrides `CLAUDE.md` §2–§5 or `.claude/rules/`.

This repo is a **UI kit library**, not an app: it ships npm packages that Kifiya web apps import. Slots below that describe an app (sign-in, backend calls, routes) are marked _not applicable_ rather than left open.

## This service

Every `<placeholder>` or `<TODO: …>` left here is a blocker Claude reports at session start.

The Kifiya UI kit: design tokens (`@kifiya/tokens`), and in later phases React components, hooks, flows, a CLI and an MCP server, published to the GitLab package registry for Kifiya web apps. No one signs into it and it calls no backend.

- First-run setup: `pnpm install --frozen-lockfile` (`.gitlab-ci.yml`) — the lockfile is committed; use the pinned package manager, not whichever is on PATH.
- Deviations from the stack defaults in `.claude/rules/stacks/node.md`: that rule describes a Fastify service (`src/main.ts`, `api/v1`, drizzle, pino), none of which exists in a component library. Commands that do apply: `pnpm typecheck` · `pnpm test` · `pnpm verify` (builds, then compiles `tailwind.css` through Tailwind itself) · `pnpm format:check`. No ESLint yet. Typecheck is separate from tests; a green test run over `any` is not a green build.
- Node and package manager versions pinned in `package.json` (`engines`, `packageManager`): Node `>=22`, `pnpm@10.24.0`. Pre-commit hooks run lint and format on staged files: no.
- Framework and router: React 19 (`@kifiya/ui`, built with tsup); no router — apps pass theirs through `KifiyaUIProvider` `linkComponent`. Rendering model: the packages must work in both server-rendered (Next.js App Router) and client-only apps; the `@kifiya/ui` bundle carries one `"use client"` banner (`tsup.config.ts`). Docs: a Nextra 4 site on Next.js 15 in `apps/docs` (`pnpm docs:dev`), statically exported; each example is a file in `apps/docs/examples/`, shown with Preview and Code tabs.
- Layout: a pnpm workspace (`pnpm-workspace.yaml`): published packages under `packages/` (each has `src/`, `test/`, and builds to `dist/`), the docs site under `apps/docs/`. Root `pnpm test`/`typecheck` build the packages first, because the docs and `@kifiya/ui` import their `dist/`. Routes: _not applicable_.
- Talks to: _not applicable_ — the kit makes no network calls. Data reaches components through props; a component never fetches.
- Every backend URL comes from one module: _not applicable_.
- Config comes from documented env vars only, never from committed secrets. The publish job authenticates with the CI job token (`.gitlab-ci.yml`). Deep dives: `README.md`.
- Conventions reviewers enforce here that are not already below or in `.claude/rules/`: token values change in `packages/tokens/src/themes/*.ts`, never in generated CSS; every public export is documented and tested; a breaking change to a component's props or a token's name is a major version bump.
- Gotchas — what costs a newcomer an afternoon: (1) package source imports use `.js` extensions (`from "./types.js"`) because `dist/` is Node ESM; (2) an app must import `@kifiya/ui/styles.css`, or Tailwind never sees the kit's classes and components render unstyled (`pnpm verify` builds a consumer app to catch this); (3) a token named like a Tailwind namespace (`--radius-*`, `--shadow-*`, `--font-*`) cannot be re-declared in `@theme` without referencing itself — expose it with `@utility` instead (`packages/tokens/src/tailwind.css`); `pnpm verify` fails on a self-reference. Tests: `pnpm test`.

## Auth and permissions

- _Not applicable as an app._ The kit authenticates no one. Permission-aware flows (Phase 3) take the caller's permission set as input and never decode a token or call IAM themselves; where permissions come from stays in each consuming app.

## Theme

- Tokens are the source of truth: `packages/tokens/src/themes/kifiya.ts` (light and dark), rendered to `dist/variables.css` and exposed to Tailwind by `packages/tokens/src/tailwind.css`. Values were taken from agent-frontend's `src/app/globals.css`; the brand hub (<http://brand-hub.kifiya.et/>) is the upstream they are re-pulled from when it changes, not hand-edited.
- Semantic tokens only. A raw palette class such as `bg-slate-900` looks themed and is not: it ignores the variable layer, survives a brand change, and inverts wrongly in dark mode.
- A missing token is added to the theme layer, never inlined as a hex in a component.
- If two token systems are in play (a brand set alongside a shadcn semantic set), name the one new work uses: both ship — the shadcn semantic set (`bg-primary`, `text-muted-foreground`) for primitives, the Kifiya brand set (`bg-brand-primary`, `text-text-strong`, `bg-status-success-soft`) for Kifiya composites. New Kifiya-specific work uses the brand set.
- Partner and white-label themes override the variables only. Layout, component API and accessibility behaviour stay shared. A theme is a new `ThemeDefinition` in `packages/tokens/src/themes/`, selected by `data-theme`.
- One UI kit and one icon set: this kit, and `lucide-react` (Phase 2, matching agent-frontend). Primitives build on Radix (`radix-ui`); a second library is a `package.json` change with lead review.
- Enforced by the theme-guard hook, not by this paragraph. Exemptions are named in `theme-exempt-paths.txt`. Operator override: `KIFIYA_ALLOW_THEME_DRIFT=1`.

## Conventions

- Compose from the kit's own primitives — tables, drawers, stat cards, buttons are built once here. Hand-building one more is how the fifth table diverges from the other four.
- Server state: _not applicable_ — components are data-agnostic. Hooks that need a server-state client take it as a parameter rather than bundling one.
- Lists page, sort and filter server-side; table components take page state as props and never load unbounded rows. Row keys are record ids, never the array index.
- Logs, analytics events and error reports carry no customer PII, account numbers or card data. Fixtures, stories and tests use synthetic data only.
- Money: integer minor units plus currency code; never floats; format only at the UI edge. Money-display components take minor units and a currency code.
- Every user-visible string is localized (locales: <TODO: confirm locales with the lead — agent-frontend ships English only>); components take copy as props or from a locale map, never hardcoded.

## Ticket and PR process

- Board and project key: <TODO: Jira project key and branch pattern — team lead>.
- PR description links the ticket; <TODO: number of approvals — team lead> approvals before merge.
- Merge strategy and target branch: <TODO: team lead>. Releases are `v*` tags; the `publish` job in `.gitlab-ci.yml` publishes them.

## Protected paths

`protected-paths.txt` is the list (prefix match from the repo root: directories and exact files, not globs). Beyond the org baseline this kit protects its publish configuration (`.gitlab-ci.yml`, `.npmrc`) — a change there changes what every consuming app installs. The hooks block edits; propose the change and a human applies it, or the operator sets `KIFIYA_ALLOW_PROTECTED=1` knowingly. A hook refusal is the system working: say what you wanted to do and why.

Keep this file under one page. Procedures belong in skills; this is standing context.
