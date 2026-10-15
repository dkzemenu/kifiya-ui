# Changelog

All notable changes to the `@kifiya/*` packages. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added

- `@kifiya/cli` 0.1.0: `kifiya-ui init` (stylesheet imports in order, registry scope line, provider file; shows every change and writes only on confirmation; idempotent), `add <screen>` (sign-in, app-shell, list-page; never overwrites; templates type-checked against the kit on every build) and `doctor` (missing or misordered imports, missing provider, mismatched versions). No runtime dependencies; never installs packages or writes a credential (R-05, D-013).
- `@kifiya/mcp` 0.1.0: a local stdio MCP server with `list_components`, `get_component` (props from the published type declarations, docs examples), `search_tokens` and `get_setup_guide`; unknown names get the closest real ones; data built into each release, no network (R-06, D-014, D-015).
- Docs: CLI and MCP page.
- `@kifiya/hooks` 0.1.0: `useDebouncedValue`, `usePaginationState`, `useDrawerState`, and `useApiMutation` on a separate `@kifiya/hooks/query` entry (React Query is an optional peer). `useApiMutation` shows the app's mapped message or fallback on failure, never the error's own text (R-03, AC-03.11, D-012).
- `@kifiya/flows` 0.1.0: `PermissionsProvider`, `useCan`, `PermissionGuard` (a loading state while permissions load, D-010); `AppShell` with a permission-filtered sidebar, collapse, mobile menu and profile menu, and `NavRouteGuard` so one declaration guards both a menu entry and its page; `SignInForm`, `ChangePasswordForm` (the app supplies the password rules, D-011) and `AuthLayout`; `FilterableListPage` with debounced search and page reset on search or filter changes (R-03, AC-03.1 – AC-03.10).
- Docs: Hooks and Flows pages with live examples.

- `@kifiya/ui` 0.1.0: the primitives and portal composites extracted from agent-frontend (`src/components/ui`, `src/components/portal`), restyled from tokens only (R-02).
- Docs site (`apps/docs`, `pnpm docs:dev`): Nextra 4 on Next.js 15, statically exported, modelled on RapidKit's docs. Getting-started guides, seven component pages, and every component as a live example with Preview and Code tabs, a viewport toggle and a copy button; a live token gallery; follows the site's light/dark switch (R-04, D-008).
- `@kifiya/ui`: `KifiyaUIProvider` with `linkComponent`, replacing the `next/link` import; `Toaster` takes `theme` instead of reading `next-themes` (AC-02.2).
- `@kifiya/ui`: `PortalTable` `error` prop, shown as an alert in place of the body (AC-02.4).
- `@kifiya/ui`: `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuRadioGroup` (the sub-menu and radio items were unusable without them), and a re-exported `toast`.
- `@kifiya/ui/styles.css`: lets an app's Tailwind find the kit's classes.
- `@kifiya/tokens`: `status-warning-strong`, `status-danger-strong`, `status-danger-hover`, `shadow-xs`, `shadow-overlay`, `shadow-drawer`, `stat-icon-bg`, `stat-icon-shadow`, `overlay` (values from agent-frontend's inline literals, D-004).

### Changed

- `@kifiya/ui` `PortalSidebarNavItem`: rebuilt on the `--sidebar-*` tokens to match agent-frontend's real app-shell nav item (the old one was unused); adds `disabled`, `badgeCount`, `collapsed`.

### Fixed

- `@kifiya/ui`: drawers, sheets and the confirm dialog return focus to the control that opened them on close. Radix only does this for its own `Trigger`, which kit overlays don't use (AC-02.5).

- `@kifiya/tokens` 0.1.0: the Kifiya theme (light and dark) as data, generated `variables.css`, a Tailwind v4 layer (`tailwind.css`) exposing the tokens as utilities plus the `k-*` classes, and `tokens.json` for tooling. Values taken unchanged from agent-frontend's `globals.css`.
