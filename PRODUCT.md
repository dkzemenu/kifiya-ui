# PRODUCT — Kifiya UI kit (kifiya-ui)

> **Owner: the product owner / tech lead. Claude reads this file and proposes changes to it; Claude never edits it.** (One exception: at first adoption, `ADOPT.md` §4 lets Claude pre-fill inventory sections, each entry marked _(draft — owner to confirm)_.)
> This is the _bare minimum_ definition of what the service solves. If something is not here, it is not a requirement — it is a pending decision (see `DECISIONS.md`).
> Every `<placeholder>` left in this file is a blocker Claude must report at session start.

## 1. Problem statement

Kifiya's web apps each build their own buttons, tables, drawers and theme. They drift apart in look and behaviour, a fix made in one app never reaches the others, and a brand change has to be made app by app. Solved means every Kifiya web app installs the same versioned tokens, components and flows, and a brand or behaviour fix reaches all of them as a package upgrade.

## 2. Actors

_(draft — owner to confirm; inferred from the session that created this repo, not from code — the kit has no consumers yet)_

| Actor                | Who they are                                               | What they need from this service                                                                                            |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `frontend-developer` | Kifiya engineers building web apps (first: agent-frontend) | Installable tokens, components, hooks and flows that look and behave the same in every app, with documentation and examples |
| `designer`           | Kifiya product designers                                   | One place to see the components and themes that actually ship, and the token names to use in designs                        |
| `ai-assistant`       | Claude and other coding assistants working in Kifiya repos | Machine-readable component and token metadata (Phase 4 MCP server)                                                          |
| `gitlab-registry`    | The GitLab package registry on `gitlab.kifiya.et`          | Receives published `@kifiya/*` packages from CI                                                                             |

## 3. Scope — bare minimum

Numbered so Claude can cite them. Never renumber; mark retired items `(retired <date>)`.

### MUST (the service is incomplete without these)

Each requirement is a user story with numbered acceptance criteria. An acceptance criterion states what is observable — never how it is built — and every one gets a test named after it (`AC-01.1` → a test called `AC-01.1 …`). A requirement with no acceptance criteria is not finished; Claude treats it as a blocker.

- **R-01** — As a `frontend-developer`, I want the Kifiya design tokens as an installable package, so that every app uses the same colours, radii, shadows and fonts in light and dark mode. _(D-001)_
  - **AC-01.1** — Given an app that imports `@kifiya/tokens/tailwind.css` after Tailwind, when it uses a brand, surface, text, border or status utility (e.g. `bg-brand-primary`), then the element takes the token's value.
  - **AC-01.2** — Given an element inside a `.dark` ancestor, when it uses a token, then it takes the token's dark-mode value.
  - **AC-01.3** — Given more than one theme ships, when an ancestor sets `data-theme="<name>"`, then the elements inside take that theme's values.
- **R-02** — As a `frontend-developer`, I want the shared primitives and Kifiya composites (button, input, select, checkbox, switch, popover, tooltip, dropdown menu, date picker, avatar, skeleton, toast, data table, drawer, confirm dialog, stat card, status chip, page header, list page, detail tabs) as a package, so that I compose screens instead of rebuilding them. _(D-001)_
  - **AC-02.1** — Given an app with `@kifiya/tokens` and `@kifiya/ui` installed, when it renders any exported component, then the component is styled with the Kifiya tokens in light and dark mode without any app CSS.
  - **AC-02.2** — Given an app that does not use Next.js, when it renders a component that navigates (a button used as a link, a sidebar nav item), then the link is the element or component the app supplies; the kit imports no framework router.
  - **AC-02.3** — Given the data table, when the user changes the page or page size, then the table reports the new page state to the app and shows only the rows the app gave it.
  - **AC-02.4** — Given the data table while loading, after an error, or with no rows, then it shows skeleton rows, an error placeholder, or an empty placeholder respectively, never a blank body.
  - **AC-02.5** — Given a dialog, drawer, select, popover or menu, when it is operated with the keyboard alone, then it can be opened, used, and closed with Escape, and focus returns to the control that opened it.
  - **AC-02.6** — Given a status chip with a tone (success, warning, danger, neutral, processing), then it uses that tone's status tokens.
- **R-03** — As a `frontend-developer`, I want shared hooks and flows (debounced value, pagination state, sign-in, app shell, filterable list page, permission guard), so that common screens behave the same in every app. _(D-001)_
  - **AC-03.1** — Given a permission guard with a permission set that lacks the required permission, then it renders its denied state and not its children.
- **R-04** — As a `frontend-developer` or `designer`, I want a documentation site with live examples of every component, so that I can see what ships before using it. _(D-001)_
  - **AC-04.1** — Given any exported component, then the docs site has a page with a live example of it.
  - **AC-04.2** — Given any docs page, when I switch between light and dark, then every example on it switches too.

### MUST NOT (hard limits — Claude will refuse and ask you to amend this file rather than route around them)

- **R-90** — MUST NOT make network calls, read credentials or decode tokens. Data and permissions reach the kit as props.
- **R-91** — MUST NOT ship customer data in fixtures, stories, tests or docs; synthetic data only.

### Non-goals (explicitly out of scope for now)

- App-specific screens (onboarding document cards, transaction views): they stay in their apps.
- Bundling font files: apps load the fonts and set the font variables.

## 4. Domain invariants

Facts that must hold at all times, in all code paths. Claude treats these as tests waiting to be written.

- **I-01** — <e.g. An order's line-item total always equals the sum of its lines, in minor units, same currency.>
- **I-02** — <e.g. A payment is never captured twice for the same idempotency key.>
- **I-03** — <…>

## 5. Business rules that are already decided

Defaults, limits, thresholds, and edge-case behaviour that a developer would otherwise have to guess. Anything a developer would guess belongs here or in `DECISIONS.md`. Numbered `B-nn` so Claude can cite them like `R-nn`; never renumber.

| ID       | Topic              | Rule                                                                   |
| -------- | ------------------ | ---------------------------------------------------------------------- |
| **B-01** | Pagination cap     | `<e.g. limit ≤ 100, default 20>`                                       |
| **B-02** | Rounding           | `<e.g. half-even at minor-unit precision>`                             |
| **B-03** | Retention          | `<e.g. soft-delete not required; hard delete after 7y per policy X>`   |
| **B-04** | Timezone semantics | `<e.g. business dates are in Africa/Addis_Ababa; instants stored UTC>` |
| **B-05** | `<…>`              | `<…>`                                                                  |

## 6. External contracts

### Exposed by this service

_(draft — owner to confirm; inventoried from `packages/*/package.json` `exports`)_

The kit exposes no network API. Its contract is the public surface of each npm package; a breaking change to it is a major version.

| Contract                                                                                     | Consumer                             | Auth                 | Notes                                                                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------- | ----------------------------------------------------------------------- |
| `@kifiya/tokens` (JS: `themes`, `kifiyaTheme`, `tokenNames`, `cssVar`, `renderVariablesCss`) | `frontend-developer`, tooling        | registry read access | ESM, typed                                                              |
| `@kifiya/tokens/variables.css` · `/tailwind.css` · `/tokens.json`                            | `frontend-developer`, `ai-assistant` | registry read access | CSS custom-property and Tailwind utility names are part of the contract |
| **Public (unauthenticated)**                                                                 | —                                    | none                 | None.                                                                   |

### Consumed by this service

_(draft — owner to confirm)_

| Dependency                                | Purpose                                         | Failure mode we accept                  | Timeout        |
| ----------------------------------------- | ----------------------------------------------- | --------------------------------------- | -------------- |
| GitLab package registry                   | Publishing on `v*` tags (`.gitlab-ci.yml`)      | Publish job fails; nothing is released  | CI job default |
| Brand hub (<http://brand-hub.kifiya.et/>) | Upstream of the token values, re-pulled by hand | Tokens stay at their last pulled values | not applicable |

## 7. Data owned

_(draft — owner to confirm)_

None. The kit stores no data and holds no PII; fixtures, stories and tests use synthetic data only.

## 8. Operational floor

| Property      | Minimum                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Availability  | `<e.g. 99.9% monthly>`                                                                             |
| p95 latency   | `<e.g. 300 ms for reads, 800 ms for writes>`                                                       |
| Throughput    | `<e.g. 50 rps sustained, 200 rps burst>`                                                           |
| RPO / RTO     | `<…>`                                                                                              |
| Observability | Structured logs per `.claude/rules/logging.md`; traces propagated; `<metrics/dashboards required>` |

## 9. Open questions

Do not answer these here. Each one is a `D-nnn` entry in `DECISIONS.md`; list the IDs so readers know what is still moving.

- `D-001` — the kit's requirements (R-01 – R-04), proposed for the owner to apply
- `D-002` — theme guard switched on for `packages/` from day one
- `D-003` — the shipped themes: `kifiya` with a dark mode, not a separate `kifiya-dark` theme
