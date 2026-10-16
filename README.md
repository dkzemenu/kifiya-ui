# Kifiya UI kit

Shared design tokens, React components, hooks and flows for Kifiya web apps, published as `@kifiya/*` packages to the GitLab package registry.

| Package          | Status | What it is                                                                                            |
| ---------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `@kifiya/tokens` | 0.2.1  | Colours, surfaces, text, status, radii, shadows and fonts; light and dark mode                        |
| `@kifiya/ui`     | 0.2.1  | Radix-based primitives and Kifiya composites (tables, drawers, forms, dialogs, charts, …)             |
| `@kifiya/hooks`  | 0.2.1  | `useDebouncedValue`, `usePaginationState`, `useDrawerState`, `useApiMutation` (`@kifiya/hooks/query`) |
| `@kifiya/flows`  | 0.2.1  | Permission guard, app shell, sign-in and change-password forms, filterable list page                  |
| docs site        | 0.2.1  | Nextra site with live Preview/Code examples (`apps/docs`, `pnpm docs:dev`)                            |
| `@kifiya/cli`    | 0.2.1  | `kifiya-ui init`, `add <screen>`, `doctor` (docs: CLI and MCP)                                        |
| `@kifiya/mcp`    | 0.2.1  | MCP server: components, props, examples and tokens for coding assistants                              |

## Install

Point the `@kifiya` scope at the GitLab registry once per app, in the app's `.npmrc`:

```ini
@kifiya:registry=https://gitlab.kifiya.et/api/v4/projects/1059/packages/npm/
//gitlab.kifiya.et/api/v4/projects/1059/packages/npm/:_authToken=${GITLAB_NPM_TOKEN}
```

The token is a personal or deploy token with `read_package_registry`, taken from the environment, never committed.

```sh
pnpm add @kifiya/tokens
```

## Use the tokens

With Tailwind v4, in the app's global stylesheet:

```css
@import "tailwindcss";
@import "@kifiya/tokens/tailwind.css";
```

```tsx
<div className="k-card p-6">
  <h2 className="k-title">Agents</h2>
  <span className="rounded-pill bg-status-success-soft px-2 text-status-success-strong">
    Active
  </span>
  <button className="rounded-control bg-brand-primary px-4 py-2 text-text-inverse hover:bg-brand-primary-hover">
    Onboard
  </button>
</div>
```

Without Tailwind, import only the variables and use them in your own CSS:

```css
@import "@kifiya/tokens/variables.css";

.my-card {
  background: var(--surface-card);
  border-radius: var(--radius-card);
}
```

**Dark mode:** add the `dark` class to `<html>` (or any ancestor). **Themes:** set `data-theme="<name>"` on an ancestor; `kifiya` is the default and applies without it.

**Fonts:** the kit doesn't bundle font files. Load Geist, Geist Mono and Inter Tight in the app (e.g. with `next/font`) and set `--font-geist-sans`, `--font-geist-mono` and `--font-inter-tight`; without them the system font stack is used.

**In code:** `import { themes, tokenNames, cssVar } from "@kifiya/tokens"`. `@kifiya/tokens/tokens.json` holds every theme as data for tooling.

### Utility names

| Group     | Utilities                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Brand     | `bg-brand-primary`, `-hover`, `-soft`, `-strong`; `bg-brand-secondary`, `-hover`, `-strong`; `brand-logo-accent`                     |
| Surfaces  | `bg-surface-canvas`, `-app`, `-sidebar`, `-card`, `-muted`, `-subtle`, `-hover`, `-neutral`                                          |
| Text      | `text-text-strong`, `-heading`, `-body`, `-subtle`, `-muted`, `-faint`, `-placeholder`, `-disabled`, `-inverse`                      |
| Borders   | `border-border-soft`, `-muted`, `-strong`                                                                                            |
| Status    | `status-success`, `-warning`, `-danger`, `-neutral`, `-processing`, each with `-soft` (and `status-success-strong`)                  |
| Charts    | `chart-1` … `chart-4`                                                                                                                |
| Logo      | `--logo-ink`, `--logo-accent` (used by `Logo`)                                                                                       |
| Radii     | `rounded-card`, `-panel`, `-tile`, `-control`, `-pill`, `-input`; `rounded-sm` … `rounded-xl` from `--radius`                        |
| Shadows   | `shadow-card`, `-card-strong`, `-subtle`, `-elevated`                                                                                |
| Fonts     | `font-sans`, `font-mono`, `font-metric`                                                                                              |
| Classes   | `k-shell`, `k-card`, `k-panel`, `k-title`, `k-subtitle`, `k-primary-button`, `k-page-header`, `k-status-chip`, `k-stat-metric-value` |
| shadcn/ui | `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`, …                           |

## Use the components

```sh
pnpm add @kifiya/tokens @kifiya/ui
```

Add one line to the stylesheet from "Use the tokens". Tailwind v4 does not scan `node_modules`, so without it every kit component renders unstyled:

```css
@import "tailwindcss";
@import "@kifiya/tokens/tailwind.css";
@import "@kifiya/ui/styles.css";
```

Wrap the app once. The kit imports no router: pass your router's link (Next.js `Link` here). Mount `Toaster` and `TooltipProvider` once if you use toasts or tooltips.

```tsx
import Link from "next/link";
import { KifiyaUIProvider, Toaster, TooltipProvider } from "@kifiya/ui";

<KifiyaUIProvider linkComponent={Link}>
  <TooltipProvider>
    {children}
    <Toaster theme={resolvedTheme} />
  </TooltipProvider>
</KifiyaUIProvider>;
```

Then compose screens from `PortalListPage`, `PortalTableCard` / `PortalTable`, `PortalDrawer`, `Dialog`, `PortalConfirmDialog`, `Form` / `FormField`, `Autocomplete`, `PortalStatCard`, `PortalStatusChip`, `NavMenu`, the `PortalDetail*` layouts and the primitives (`Button`, `Input`, `Textarea`, `Select`, `Text`, `Icon`, `Image`, `Logo`, …). The bundle is marked `"use client"`, so Next.js server components can import it directly.

**Charts** come from a separate entry, so apps without charts don't install recharts: `pnpm add recharts`, then `import { Chart } from "@kifiya/ui/chart";`.

**Tables page on the server.** Pass `pagination` and `onPaginationChange` and the table shows only the rows you give it. Pass `isLoading`, `error` (your message) or `placeholder` for the loading, error and empty states.

**Browse every component** on the docs site, light and dark: `pnpm docs:dev`, then open <http://localhost:3100>.

## Develop

```sh
pnpm install --frozen-lockfile
pnpm typecheck && pnpm test && pnpm verify && pnpm format:check
```

To browse the components and every token, light and dark: `pnpm docs:dev`, then open <http://localhost:3100>. The site is a static export (`pnpm --filter @kifiya/docs build` → `apps/docs/out/`).

Token values live in `packages/tokens/src/themes/*.ts`; the CSS is generated from them by `pnpm build`. `pnpm verify` compiles the Tailwind layer through Tailwind itself, which catches errors the unit tests can't.

## Release

There is no CI runner yet (D-009), so checks and publishing run on your machine.

**Before every push:**

```sh
pnpm check   # format, typecheck, tests, verify (incl. docs build)
```

**To publish** a new version:

1. Bump `version` in each changed `packages/*/package.json` and add the entry to `CHANGELOG.md`; merge.
2. Once, in your **user** `~/.npmrc` (never the repo's), with a personal access token that has the `api` scope:

   ```ini
   @kifiya:registry=https://gitlab.kifiya.et/api/v4/projects/1059/packages/npm/
   //gitlab.kifiya.et/api/v4/projects/1059/packages/npm/:_authToken=${GITLAB_NPM_TOKEN}
   ```

   Keep the token in your shell environment (`export GITLAB_NPM_TOKEN=...`), not in a file in the repo.

3. After the MR is merged, from `main`:

   ```sh
   git switch main && git pull
   read -s GITLAB_NPM_TOKEN && export GITLAB_NPM_TOKEN   # paste the token, press Enter
   pnpm release            # or `pnpm release --dry-run` to try every step without publishing
   ```

   `pnpm release` refuses, before building anything, when the tree has uncommitted changes, you are not on `main`, local `main` differs from GitLab's (an unmerged MR), the packages are at different versions, the version is already tagged or published, or the token is not set. Then it runs `pnpm check`, publishes, and creates and pushes the `vX.Y.Z` tag itself, only after every package is published. Do not tag by hand.

When a GitLab runner is available, set the project variable `ENABLE_CI=true` (Settings → CI/CD → Variables) and the `.gitlab-ci.yml` already in the repo takes over both: it checks every push and publishes on `v*` tags. Until then it creates no pipelines.

## Working with Claude

This repo uses the Kifiya Claude harness (`CLAUDE.md`, `claude-md-variants/`, `PRODUCT.md`, `DECISIONS.md`). Copy `GITLAB_TOKEN` into `.env` (git-ignored, loaded by direnv) for the GitLab MCP server.
