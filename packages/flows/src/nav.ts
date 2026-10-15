import type { LucideIcon } from "lucide-react";

import type { PermissionRequirement } from "./permissions";

/**
 * One navigation entry. Its `permission` decides both whether the entry is
 * shown and whether its page renders (`NavRouteGuard`), so the two cannot
 * drift apart (AC-03.4).
 */
export interface NavEntry {
  label: string;
  /** Omit for a disabled entry. */
  href?: string;
  icon: LucideIcon;
  permission?: PermissionRequirement;
  badgeCount?: number;
  disabled?: boolean;
  /** Match only this exact path (default: the path and anything under it). */
  exact?: boolean;
  /** Match a different prefix than `href` (e.g. href `/agents/list`, prefix `/agents`). */
  activePathPrefix?: string;
}

export interface AppNavigation {
  main: NavEntry[];
  /** Pinned to the bottom of the sidebar (e.g. Settings). */
  footer?: NavEntry[];
}

export function isNavEntryActive(pathname: string, entry: NavEntry): boolean {
  const base = entry.activePathPrefix ?? entry.href;
  if (entry.disabled || !entry.href || !base) return false;
  if (entry.exact) return pathname === base;
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** The entry for `pathname`; the longest matching prefix wins. */
export function findNavEntry(
  navigation: AppNavigation,
  pathname: string,
): NavEntry | undefined {
  return [...navigation.main, ...(navigation.footer ?? [])]
    .filter((entry) => isNavEntryActive(pathname, entry))
    .sort(
      (a, b) =>
        (b.activePathPrefix ?? b.href ?? "").length -
        (a.activePathPrefix ?? a.href ?? "").length,
    )[0];
}
