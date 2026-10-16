# DECISIONS — pending-decision ledger

> **Claude appends entries. Only a human changes status to `RESOLVED` or `REJECTED`.**
> Claude reads this file every session and lists all `PENDING` / `ASSUMED` / `DEFERRED` items in its first reply.
> Claude raises all decisions for one task in a single batch, blocking items first, each with a recommendation — never one interrupt per item. For anything non-blocking it prefers `ASSUMED` with a `DECISION: D-nnn` marker in the code over a question.
> A change to what the product does — any behaviour an `R-`, `AC-`, `I-` or `B-` describes — is implemented only against a `RESOLVED` entry here. That entry is the traceable human input.

**Statuses**

| Status     | Meaning                                                                                                                    | Who sets it |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `PENDING`  | Ambiguity raised, unanswered. Dependent work is stopped if blocking.                                                       | Claude      |
| `ASSUMED`  | Non-blocking; Claude proceeded on its recommendation. Code sites carry `DECISION: D-nnn` markers. **Still needs a human.** | Claude      |
| `DEFERRED` | A request that fell outside `PRODUCT.md` scope. Parked with the proposed `PRODUCT.md` diff; nothing built.                 | Claude      |
| `RESOLVED` | Human decided. Claude implements and removes markers.                                                                      | Human only  |
| `REJECTED` | Question withdrawn / request declined.                                                                                     | Human only  |

**Entry template** (copy verbatim; IDs are sequential and never reused)

```
### D-nnn — <short title>
- **Raised:** YYYY-MM-DD · **Status:** PENDING | ASSUMED | DEFERRED · **Blocking:** yes | no
- **Context:** where this came up (feature / file / request), and why PRODUCT.md and the rules do not settle it.
- **Options:**
  - A) …
  - B) …
- **Recommendation:** <A or B>, because …
- **Affects:** paths / endpoints / tables
- **Resolution:** _(human)_
- **Resolved:** _(date)_
```

For `DEFERRED` entries, **Options** is replaced by **Proposed PRODUCT.md diff** (a fenced diff block the human can apply).

**Release gate:** `grep -rn "DECISION: D-" src/` (or the stack's source root) must be empty, and this file's _Open_ section must contain no `ASSUMED` items.

---

## Open

### D-001 — the kit's requirements: none written yet

- **Raised:** 2026-10-15 · **Status:** DEFERRED · **Blocking:** yes (for Phase 2 onward)
- **Context:** This repo was created in a session on 2026-10-15 to build a Kifiya UI kit inspired by RapidKit (<https://rapidset.github.io/RapidKit/INSTALLATION/>). Decided by the user in that session: a new repo, distributed as npm packages through the GitLab package registry, seeded from agent-frontend's `src/components/ui/`, `src/components/portal/`, `src/hooks/` and theme, and covering tokens and theming, core components, hooks and flows, and a docs site plus CLI/MCP. `PRODUCT.md` §3 is still the template, so none of this is a written requirement (`CLAUDE.md` §2). Phase 1 (`@kifiya/tokens`) was built under the session's go; the wording below must be applied before Phase 2.
- **Proposed PRODUCT.md diff:**

```diff
@@ §1 Problem statement
-<One paragraph. ...>
+Kifiya's web apps each build their own buttons, tables, drawers and theme. They drift apart in look and behaviour, fixes made in one app never reach the others, and a brand change has to be made app by app. Solved means every Kifiya web app installs the same versioned tokens, components and flows, and a brand or behaviour fix ships to all of them as a package upgrade.
@@ §3 MUST
-- **R-01** — As a `<actor from §2>`, ...
+- **R-01** — As a `frontend-developer`, I want the Kifiya design tokens as an installable package, so that every app uses the same colours, radii, shadows and fonts in light and dark mode.
+  - **AC-01.1** — Given an app that imports `@kifiya/tokens/tailwind.css` after Tailwind, when it uses a brand, surface, text, border or status utility (e.g. `bg-brand-primary`), then the element takes the token's value.
+  - **AC-01.2** — Given an element inside a `.dark` ancestor, when it uses a token, then it takes the token's dark-mode value.
+  - **AC-01.3** — Given more than one theme ships, when an ancestor sets `data-theme="<name>"`, then the elements inside take that theme's values.
+- **R-02** — As a `frontend-developer`, I want the shared primitives and Kifiya composites (button, inputs, select, table with server-side pagination, drawer, confirm dialog, stat card, status chip, page header, list page, detail tabs) as a package, so that I compose screens instead of rebuilding them.
+  - **AC-02.1** — <owner to write, per component, once the Phase 2 list is agreed>
+- **R-03** — As a `frontend-developer`, I want shared hooks and flows (debounced value, pagination state, sign-in, app shell, filterable list page, permission guard), so that common screens behave the same in every app.
+  - **AC-03.1** — Given a permission guard given a permission set that lacks the required permission, then it renders its denied state and not its children.
+- **R-04** — As a `frontend-developer` or `designer`, I want a documentation site with live examples of every component in every theme and mode, so that I can see what ships before using it.
+  - **AC-04.1** — Given any exported component, then the docs site has a page with a live example of it.
@@ §3 MUST NOT
-- **R-90** — <e.g. ...>
-- **R-91** — <e.g. ...>
+- **R-90** — MUST NOT make network calls, read tokens or decode credentials. Data and permissions reach the kit as props.
+- **R-91** — MUST NOT ship customer data in fixtures, stories, tests or docs; synthetic data only.
@@ §3 Non-goals
+- App-specific screens (onboarding document cards, transaction views) — they stay in their apps.
```

- **Update 2026-10-15 (patch ready):** `PRODUCT.md` is protected, so the wording is handed over as a patch tested against this repo: `../kifiya-ui-D-001-product.patch`; a human applies it with `git apply`. It differs from the diff above in R-02, which now has concrete acceptance criteria (AC-02.1 – AC-02.6: tokens with no app CSS, no framework router, server-side table paging, loading/error/empty states, keyboard and focus behaviour, status tones) instead of a placeholder, and in R-04, which gains AC-04.2 (light/dark on every docs page).
- **Update 2026-10-15 (applied):** the user applied the patch; `PRODUCT.md` now carries R-01 – R-04 and R-90/R-91 (verified: AC-02.1 – AC-02.6 present, harness check 26/26). Phase 2 was built against it. **A human can mark this entry RESOLVED.**
- **Affects:** `PRODUCT.md` §1, §3; every package after `@kifiya/tokens`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-002 — theme guard on for `packages/` from day one

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** `.claude/hooks/theme-guard.sh` ships inert (`GUARDED_ROOTS=""`). agent-frontend left it off because 34 existing files would have failed it (its D-001). This repo has no legacy code, and a UI kit that inlines literal colours defeats its own purpose, so it is switched on for `packages/`. The token source itself necessarily holds literal colours, so `packages/tokens/src/themes/` is listed in `theme-exempt-paths.txt`.
- **Options:**
  - A) `GUARDED_ROOTS="packages/"`, with the theme definitions exempt.
  - B) Leave it off, as the template ships.
- **Recommendation:** A. Enforcement costs nothing while the code already passes it.
- **Update 2026-10-15:** extended to `apps/` (the docs site) by a human-applied patch; `GUARDED_ROOTS="packages/ apps/"`. All existing docs code already passed it.
- **Affects:** `.claude/hooks/theme-guard.sh`, `theme-exempt-paths.txt`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-003 — one `kifiya` theme with a dark mode, rather than a separate `kifiya-dark` theme

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** The plan agreed in session named two themes, `kifiya` and `kifiya-dark`. agent-frontend models dark as a mode (the `.dark` class) over one set of tokens, not as a separate theme. Treating it as a mode lets every future theme (a partner or white-label one) have a dark variant too, and keeps agent-frontend's existing `.dark` toggle working unchanged.
- **Options:**
  - A) Themes are selected by `data-theme`, and light/dark is a separate mode by `.dark`. Ships: `kifiya` (light + dark).
  - B) `kifiya-dark` as a separate `data-theme` value with no mode concept.
- **Recommendation:** A, as implemented in `packages/tokens/src/css.ts`.
- **Affects:** `packages/tokens/src/`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-004 — new tokens keep agent-frontend's literal values in dark mode, including two that read poorly

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** Phase 2 replaced the components' inline colours with tokens (AC-02.1). Nine values had no token: `status-warning-strong` (`#9a6700`), `status-danger-strong` (`#b42318`), `status-danger-hover` (`#dc2626`), `shadow-xs`, `shadow-overlay`, `shadow-drawer`, `stat-icon-bg` (`#2f3135`), `stat-icon-shadow` and `overlay`. agent-frontend used each literal in both modes, so each token has the same value in light and dark: the kit looks exactly like the portal does today. Seen in Storybook, dark mode: the Pending and Suspended chips' dark text on a dark tinted chip is hard to read. Colour mixes with `white` (status chips, stat cards) now mix with `--surface-card` instead: identical in light (`#ffffff`), and no longer a white haze in dark.
- **Options:**
  - A) Keep today's values in dark (as implemented); agent-frontend looks unchanged when it adopts the kit.
  - B) Give the two text tokens readable dark values (e.g. `status-warning-strong` → `#fbbf24`, `status-danger-strong` → `#f87171`, the existing dark `status-warning`/`status-danger`), changing dark mode for every app.
- **Recommendation:** B for the two chip text tokens, after a designer looks at it; A for the rest. Colour on screen is a product call, so the kit ships A until then.
- **Affects:** `packages/tokens/src/themes/kifiya.ts`, `packages/ui/src/components/portal-status-chip.tsx`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-005 — Phase 2 dependencies beyond the approved list, and behaviour that differs from agent-frontend

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** The Phase 2 dependency list was approved in session on 2026-10-15. Three runtime packages were missed in that list and added because approved components cannot work without them; all three are already used by agent-frontend: `@tanstack/react-table` (the data table is built on it), `tw-animate-css` (the overlays' open/close animation classes; CSS only) and `@radix-ui/react-tooltip` (replaces the unscoped `radix-ui` import the tooltip used, matching the other seven scoped Radix packages). Separately, the extracted components behave differently from agent-frontend's copies in four ways, each required by an AC-02 criterion or needed to make an export usable: links come from `KifiyaUIProvider` (AC-02.2); `PortalTable` takes `error` (AC-02.4); overlays return focus to their opener (AC-02.5; agent-frontend's drawers drop focus to `<body>`); `PortalSidebarNavItem` was rebuilt on the app-shell look (the old one was unused).
- **Options:**
  - A) Keep the three packages and the four differences (as implemented).
  - B) Remove a package and the component that needs it.
- **Recommendation:** A. None adds a library agent-frontend does not already ship.
- **Affects:** `packages/ui/package.json`, `packages/ui/src/`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-006 — components still carry English default copy

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** The variant's convention is that components take copy as props. Several extracted components have English defaults: `PortalTable` `placeholder` ("No records found"), `PortalConfirmDialog` `cancelLabel` ("Cancel"), `PortalPermissionDenied` ("this section", and its body text), the pagination labels, and the review-notes placeholder. Every one can already be overridden except the hard-coded body and pagination text. The locale list is still a TODO in the variant.
- **Options:**
  - A) Keep the English defaults; make the remaining hard-coded strings props once locales are decided.
  - B) Remove the defaults now and make every string a required prop.
- **Recommendation:** A. B breaks every call site in agent-frontend for no gain until a second locale exists.
- **Affects:** `packages/ui/src/components/`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-007 — onboarding-shaped layouts are in the kit

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** `PortalPersonalInformationLayout`, `PortalBusinessInformationLayout` and `PortalApplicationStatusLayout` were in agent-frontend's shared `components/portal/detail-drawer` folder and were extracted with it. Their props are onboarding concepts (`emergency`, `fraudEngineBadgeLabel`). The kit's non-goals keep app-specific screens out (`PRODUCT.md` §3).
- **Options:**
  - A) Keep them, as shared detail layouts more than one app's onboarding could use.
  - B) Leave them in agent-frontend and remove them from the kit before 1.0.
- **Recommendation:** B, unless a second app needs them; the generic pieces they are built from (`PortalDetailInfoSubsection`, `PortalDetailTwoColumnStackedGrid`) stay in the kit either way.
- **Affects:** `packages/ui/src/components/detail/`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-008 — docs site on Nextra instead of Storybook

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** Phase 2 shipped a Storybook. The user then asked whether RapidKit (the kit's inspiration) uses Storybook: it does not; its docs are a Nextra site with hand-built Preview/Code example blocks. Offered keeping Storybook plus a later guide site, or switching to Nextra completely; the user chose the switch in session on 2026-10-15. Storybook, its config and stories are removed; the 46 stories became example files in `apps/docs/examples/`, and R-04's tests moved to `apps/docs/test/`. Choosing the switch brought new dependencies: `nextra` and `nextra-theme-docs` 4.6.1, `next` 15.5 (agent-frontend's major; 16 is current) and `@tailwindcss/postcss`. Three things a human should know:
  1. **zod is pinned to 4.1.13 for Nextra only** (`pnpm-workspace.yaml` `overrides`). Nextra 4.6.1 predates zod 4.4, whose stricter schemas reject Nextra's own layout props ("expected nonoptional … at children"). Remove the override once Nextra supports newer zod.
  2. **The docs site fixes the CSS layer order** (`apps/docs/app/globals.css`). Nextra ships its own Tailwind build; whichever stylesheet the browser loads second ranks its layers higher, and Next loaded the kit's first, so Nextra's reset erased the kit's padding and borders. Any app that also loads another Tailwind-built stylesheet would hit the same thing; for ordinary apps it does not arise.
  3. **The site is not hosted yet.** It builds as static files (`apps/docs/out/`, `DOCS_BASE_PATH` for a sub-path). Publishing it on GitLab Pages needs a `pages` job in `.gitlab-ci.yml`, a protected path, so it is a proposal for a human, not done here.
- **Options:**
  - A) Nextra only (as implemented).
  - B) Restore Storybook alongside Nextra for component-state exploration.
- **Recommendation:** A. One docs site, and every example is a real file that the Code tab shows trimmed to what it uses.
- **Affects:** `apps/docs/`, `pnpm-workspace.yaml`, `packages/ui/` (Storybook removed), root `package.json` scripts
- **Resolution:** _(human)_ — the switch to Nextra was chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-009 — no CI yet: checks and publishing run locally

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** The first push produced no pipeline. agent-frontend builds on Azure Pipelines and has no `.gitlab-ci.yml`, so `gitlab.kifiya.et` most likely has no runner for this project; the user has no Azure permission for a new app. Offered: ask for a GitLab runner, register a personal runner, or run without CI for now. The user chose the last in session on 2026-10-15. `.gitlab-ci.yml` stays as it is: it needs no change once a runner exists.
- **What this means until then:** nothing enforces the checks on a merge request, so `pnpm check` is run by hand before each push, and packages are published from a developer's machine with `pnpm release` and a personal token in the user's `~/.npmrc` (README "Release"). The docs site cannot be hosted on GitLab Pages without a runner.
- **Options:**
  - A) Local checks and publishing (as now).
  - B) Ask the platform team for a shared or group GitLab runner.
  - C) A project runner on a developer's machine.
- **Recommendation:** A now, B soon: a check that depends on someone remembering to run it is not a gate, and published packages should come from a clean CI build rather than a laptop.
- **Update 2026-10-15:** a pipeline was in fact created on every push and sat pending with no runner, blocking the merge request. `.gitlab-ci.yml` now starts with a `workflow` rule that creates no pipeline unless the project variable `ENABLE_CI` is `true` (human-applied patch). To turn CI on once a runner exists: add `ENABLE_CI=true` under Settings → CI/CD → Variables.
- **Affects:** `package.json` (`check`, `release`), `README.md`, `.gitlab-ci.yml` (off unless `ENABLE_CI=true`)
- **Resolution:** _(human)_ — option A chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-010 — permission guard: what shows while permissions load

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** Phase 3 (R-03). agent-frontend's route guard renders its children while the permission set is still loading and only redirects once it has settled (`route-permission-guard.tsx`). For a page that is acceptable; for a guarded button or section it means a user without the permission briefly sees it. AC-03.2 asks for a loading state instead.
- **Options:**
  - A) A loading state while permissions load: an optional `loading` prop, defaulting to nothing rendered. Children appear only once access is confirmed.
  - B) Render the children while loading, as agent-frontend's route guard does.
- **Recommendation:** A. Briefly showing a control a user cannot use, then removing it, is worse than briefly showing nothing. An app that wants a skeleton passes one as `loading`.
- **Affects:** `@kifiya/flows` `PermissionGuard`, `AppShell` navigation
- **Resolution:** _(human)_ — option A, a loading state while permissions load; chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-011 — sign-in and change-password: whose password rules

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** no
- **Context:** Phase 3 (R-03, AC-03.8). agent-frontend's union-portal flows require at least 8 characters including a number (its AC-07.8); staff password rules are IAM's. Password policy is a product and security rule that differs between apps and identity providers, so the kit should not fix one.
- **Options:**
  - A) The app passes `validatePassword(password) => string | null` (the reason, or null). The kit enforces only that the confirmation matches.
  - B) The kit ships agent-frontend's rule (8+ characters and a number) as the default and lets apps override it.
- **Recommendation:** A. A default would quietly become the rule for apps that forget to set theirs. The docs show agent-frontend's rule as the example. **Security-adjacent:** flagged for Security-team review, not self-assessed.
- **Affects:** `@kifiya/flows` `ChangePasswordForm`, `SignInForm`
- **Resolution:** _(human)_ — option A, the app supplies the password rules; chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-012 — `useApiMutation`: React Query as a peer dependency, and no raw error text

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** yes (for `useApiMutation` only)
- **Context:** Phase 3 (R-03, AC-03.11). agent-frontend's `useApiMutation` wraps React Query's `useMutation`, invalidates query keys on success, and toasts on success and error. Two things change in the kit:
  1. **A new dependency.** `@tanstack/react-query` (already used by agent-frontend) becomes an **optional peer dependency** of `@kifiya/hooks`: apps that use the hook bring their own client, as the variant requires ("hooks take the server-state client from the app"). The other three hooks need nothing.
  2. **Error copy.** The current hook toasts `err.message`, which can be the backend's raw text; agent-frontend's D-008 already replaced that with status-based copy on its own screens. The kit takes `errorMessage(error, variables) => string` from the app and, without it, shows the app's `errorFallback`, never the raw text.
- **Options:**
  - A) Both changes as described.
  - B) Leave `useApiMutation` out of the kit; ship the three dependency-free hooks only.
- **Recommendation:** A. It is the hook agent-frontend uses most, and the error-copy change is the safer behaviour.
- **Affects:** `@kifiya/hooks` `package.json` and `useApiMutation`
- **Resolution:** _(human)_ — option A, include `useApiMutation` with React Query as an optional peer dependency and no raw error text; chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-013 — CLI: what `init` may change, and whether it installs packages

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** yes (for the CLI)
- **Context:** Phase 4 (R-05). A CLI that edits an app's files and runs its package manager is acting on someone else's repo. AC-05.1 already says nothing is written before confirmation; what is still open is how far `init` goes.
- **Options:**
  - A) `init` edits files only: the global stylesheet's imports, a provider snippet file, and the registry **scope** line in `.npmrc` (never a token). It prints the `pnpm add` command instead of running it. Shows a diff first; writes on confirmation or `--yes`.
  - B) A, and it also runs the app's package manager to install the packages.
- **Recommendation:** A. Installing is one command the developer can see and run; running it for them means the CLI picks the package manager, touches the lockfile and needs registry credentials, all of which differ per app. No runtime dependencies: Node's own argument parser and file APIs are enough.
- **Affects:** `packages/cli` (new)
- **Resolution:** _(human)_ — option A, `init` edits files only and prints the install command; chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-014 — MCP server: how assistants run it and where its data comes from

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** yes (for the MCP server)
- **Context:** Phase 4 (R-06). RapidKit ships an MCP server so coding assistants (Claude Code among them) can look up its components. Kifiya repos already configure MCP servers in `.mcp.json` (golden template).
- **Options:**
  - A) A local stdio server, `npx @kifiya/mcp`, added to a repo's `.mcp.json`. Its data (components, props from the published type declarations, docs examples, tokens) is generated when the package is built, so answers match that release and it needs no network (AC-06.5).
  - B) A hosted server the whole company points at, always on the latest kit.
- **Recommendation:** A. It needs no hosting or credentials, works offline, and answers for the kit version the repo actually installs; B would answer for a version the app may not use.
- **Affects:** `packages/mcp` (new); `.mcp.json` in consuming repos (their change, not this repo's)
- **Resolution:** _(human)_ — option A, a local stdio server per repo with data built into each release; chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-015 — new dependency: the MCP SDK

- **Raised:** 2026-10-15 · **Status:** ASSUMED · **Blocking:** yes (for the MCP server)
- **Context:** Phase 4 (R-06). An MCP server needs the protocol implementation. `@modelcontextprotocol/sdk` is the official SDK (v1.32.1, updated 2026-10-05, maintained by the protocol's authors). It needs `zod` (3.25+ or 4), which the workspace already has through Nextra. The CLI needs no dependency (D-013). Building the props data reads the published `.d.ts` files with `typescript`, already a dev dependency.
- **Options:**
  - A) Add `@modelcontextprotocol/sdk` and `zod` as dependencies of `@kifiya/mcp` only.
  - B) Implement the stdio JSON-RPC protocol by hand, with no dependency.
- **Recommendation:** A. The protocol has versioned handshakes and capability negotiation; a hand-rolled copy would drift from what assistants expect.
- **Affects:** `packages/mcp/package.json`
- **Resolution:** _(human)_ — option A, `@modelcontextprotocol/sdk` and `zod` in `@kifiya/mcp` only; chosen by the user in session on 2026-10-15.
- **Resolved:** _(date)_

### D-016 — ten more components in `@kifiya/ui`

- **Raised:** 2026-10-16 · **Status:** DEFERRED · **Blocking:** yes (nothing below is built until the owner applies the wording)
- **Context:** Request in session: widen the kit with the general-purpose components it still lacks. R-02 lists the components the kit ships, and these are not on it. Components the kit already has under its own names stay as they are, with no aliases (user's call in session).
  - **New:** `Dialog` (a general modal; only the confirm dialog and the drawer exist today), `Textarea`, `Autocomplete` (async search, single selection, built on the existing Popover), `Chart` (D-017), `Form` / `FormField` / `FormSubmit` (D-018), `Icon` (a lucide icon at the kit's sizes and tones), `Image` (loading skeleton and a fallback when it fails), `Logo` (the Kifiya full-colour mark and the icon mark, from agent-frontend's `public/`), `NavMenu` (horizontal navigation with the current entry marked) and `Text` (headings, body, caption and label styles from the tokens).
  - **Version:** these are additions only, so the release is 0.2.0.
- **Proposed PRODUCT.md diff:** handed over as `../kifiya-ui-components-product.patch` (tested with `git apply --check`). It adds the components to R-02's list and adds AC-02.7 – AC-02.13.
- **Affects:** `packages/ui`, `apps/docs`, `packages/mcp` (its data picks the new components up when it is built), `PRODUCT.md` R-02
- **Resolution:** _(human)_
- **Resolved:** _(date)_

### D-017 — Chart on recharts, as an optional peer dependency

- **Raised:** 2026-10-16 · **Status:** ASSUMED · **Blocking:** yes (for Chart)
- **Context:** A chart with tooltips, axes and responsive sizing is a large thing to draw by hand; agent-frontend's one chart is hand-drawn SVG. `recharts` 3.10.1 (updated 2026-10-13) supports React 19 and pulls in about a dozen packages of its own (Redux Toolkit, immer, victory-vendor among them).
- **Options:**
  - A) Wrap recharts in a separate entry, `@kifiya/ui/chart`, with recharts as an optional peer dependency, so an app that never draws a chart installs nothing extra (AC-02.9). Line, bar, area and donut, coloured from the tokens.
  - B) Hand-drawn SVG charts, no dependency.
- **Recommendation:** A. B would mean writing and maintaining tooltips, axes and resizing ourselves.
- **Affects:** `packages/ui/package.json`, a new `packages/ui/src/chart` entry
- **Resolution:** _(human)_ — option A chosen by the user in session on 2026-10-16.
- **Resolved:** _(date)_

### D-018 — Form state from a small hook of our own, no form library

- **Raised:** 2026-10-16 · **Status:** ASSUMED · **Blocking:** no
- **Context:** `Form`, `FormField` and `FormSubmit` need something holding values, errors and the submitting state. agent-frontend's forms (the union onboarding form, the sign-in form) do this by hand with per-field validate functions.
- **Options:**
  - A) A `useForm` hook (not `useFormState`, which react-dom already exports) exported by `@kifiya/ui` beside the components (in `@kifiya/hooks` the two packages would depend on each other, since `@kifiya/hooks` already uses the toast from `@kifiya/ui`): initial values, a validate function per field, errors shown under each field, the first invalid field focused, submit disabled while submitting. The components read it through context. No new dependency.
  - B) Build on react-hook-form as an optional peer.
- **Recommendation:** A. It covers the forms the apps have today; B adds a dependency and an API every app must learn. Field arrays (like the union form's representative leads) stay plain arrays in the values.
- **Affects:** `packages/ui`
- **Resolution:** _(human)_ — option A chosen by the user in session on 2026-10-16.
- **Resolved:** _(date)_

### D-019 — the logo in dark mode, and what the small mark is

- **Raised:** 2026-10-16 · **Status:** ASSUMED · **Blocking:** no
- **Context:** `Logo` (D-016) is drawn from agent-frontend's `public/Kifiya_Full_Color.svg`: a dark teal wordmark (`#02404f`) with an orange dot (`#eb7d23`). Neither colour is a token, and the teal is nearly invisible on dark-mode surfaces. agent-frontend's `public/icon.svg` is not a logo (a "K" typed in a system font on an orange square), so it was not used. How the brand appears is the brand owner's call, and no brand guide was available.
  - Two new tokens hold the colours: `logo-ink` and `logo-accent`.
  - **Dark mode:** `logo-ink` becomes `var(--text-strong)` (near white); the orange dot is unchanged.
  - **The mark** (`variant="mark"`) is the logo's own "k" shapes, in `logo-ink`, without the wordmark.
- **Options:**
  - A) As above.
  - B) An official reversed (dark-background) logo and mark from the brand owner, replacing both.
- **Recommendation:** A until B exists. Swapping in official artwork is a change to one file.
- **Affects:** `packages/tokens/src/themes/kifiya.ts`, `packages/ui/src/components/logo.tsx`
- **Resolution:** _(human)_
- **Resolved:** _(date)_

## Resolved

_(entries move here when a human sets RESOLVED / REJECTED; never delete — this is the audit trail of product decisions)_
