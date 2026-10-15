"use client";

import {
  Avatar,
  AvatarFallback,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  PortalButton,
  PortalSidebarNavItem,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
} from "@kifiya/ui";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  findNavEntry,
  isNavEntryActive,
  type AppNavigation,
  type NavEntry,
} from "./nav";
import { checkAccess, PermissionGuard, usePermissionsSet } from "./permissions";

export interface AppShellProfile {
  name: string;
  /** Second line in the profile menu, e.g. an email or the user's union. */
  subtitle?: string;
  initials: string;
}

export interface AppShellMenuAction {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
}

export interface AppShellProps {
  /** Shown at the left of the top bar, e.g. the app's logo. */
  brand: ReactNode;
  navigation: AppNavigation;
  /** The current path; the app reads it from its router. */
  pathname: string;
  profile?: AppShellProfile;
  /** Items in the profile menu, e.g. Log out. */
  profileActions?: AppShellMenuAction[];
  /** Extra controls before the profile menu, e.g. a theme toggle. */
  topBarActions?: ReactNode;
  /** Shown below the content, e.g. a status bar. */
  footer?: ReactNode;
  /** Persists the sidebar's collapsed state in localStorage under this key. */
  collapsedStorageKey?: string;
  defaultCollapsed?: boolean;
  labels?: Partial<typeof defaultLabels>;
  /** Overrides the full-viewport frame, e.g. to embed the shell in a preview. */
  className?: string;
  children: ReactNode;
}

const defaultLabels = {
  menu: "Menu",
  mainNavigation: "Main navigation",
  expandSidebar: "Expand sidebar",
  collapseSidebar: "Collapse sidebar",
  openNavigation: "Open navigation",
  navigationTitle: "Navigation",
  openProfileMenu: "Open profile menu",
};

type Labels = typeof defaultLabels;

function NavSkeletonRow({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center",
        collapsed ? "justify-center px-0" : "gap-3 px-3",
      )}
    >
      <Skeleton className="size-[18px] shrink-0 rounded-[4px]" />
      {collapsed ? null : <Skeleton className="h-3 w-24 rounded-full" />}
    </div>
  );
}

function NavEntries({
  entries,
  pathname,
  collapsed,
}: {
  entries: NavEntry[];
  pathname: string;
  collapsed: boolean;
}) {
  const permissions = usePermissionsSet();
  if (permissions === undefined) {
    // D-010: while permissions load, show placeholders, never entries the
    // user may not be allowed to see.
    return entries.map((entry) => (
      <NavSkeletonRow key={entry.label} collapsed={collapsed} />
    ));
  }
  return entries
    .filter((entry) => checkAccess(permissions, entry.permission) === "allowed")
    .map((entry) => (
      <PortalSidebarNavItem
        key={entry.label}
        href={entry.disabled ? undefined : entry.href}
        label={entry.label}
        icon={entry.icon}
        badgeCount={entry.badgeCount}
        disabled={entry.disabled}
        collapsed={collapsed}
        active={isNavEntryActive(pathname, entry)}
      />
    ));
}

export function AppSidebar({
  navigation,
  pathname,
  collapsible = true,
  collapsedStorageKey,
  defaultCollapsed = false,
  labels,
  className,
}: Pick<
  AppShellProps,
  "navigation" | "pathname" | "collapsedStorageKey" | "defaultCollapsed"
> & {
  /** Hide the collapse toggle (the mobile menu uses the full sidebar). */
  collapsible?: boolean;
  labels: Labels;
  className?: string;
}) {
  const [collapsedState, setCollapsedState] = useState(defaultCollapsed);
  const collapsed = collapsible && collapsedState;
  const permissions = usePermissionsSet();
  const footer = navigation.footer ?? [];
  // Hide the footer section (and its divider) when none of its entries are
  // allowed; while loading, keep it for the placeholder rows.
  const footerVisible =
    permissions === undefined
      ? footer.length > 0
      : footer.some(
          (entry) => checkAccess(permissions, entry.permission) === "allowed",
        );

  useEffect(() => {
    if (!collapsible || !collapsedStorageKey) return;
    try {
      const stored = localStorage.getItem(collapsedStorageKey);
      if (stored !== null) setCollapsedState(stored === "true");
    } catch {
      // Storage can be unavailable (private mode); keep the default.
    }
  }, [collapsible, collapsedStorageKey]);

  const toggleCollapsed = () => {
    setCollapsedState((previous) => {
      if (collapsedStorageKey) {
        try {
          localStorage.setItem(collapsedStorageKey, String(!previous));
        } catch {
          // Not persisted; the toggle still works for this visit.
        }
      }
      return !previous;
    });
  };

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "flex h-full flex-col overflow-y-auto overflow-x-hidden border-r border-(--sidebar-border) bg-(--sidebar-bg) py-4 transition-[width] duration-200",
        collapsed ? "w-[68px] px-2.5" : "w-[232px] px-3",
        className,
      )}
    >
      <div
        className={cn(
          "mb-2 flex items-center",
          collapsed ? "justify-center" : "justify-between pl-3",
        )}
      >
        {collapsed ? null : (
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--sidebar-muted)">
            {labels.menu}
          </span>
        )}
        {collapsible ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={
              collapsed ? labels.expandSidebar : labels.collapseSidebar
            }
            aria-expanded={!collapsed}
            className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-(--sidebar-text) transition-colors hover:bg-(--sidebar-hover) hover:text-(--sidebar-heading) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--sidebar-bg)"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      <nav aria-label={labels.mainNavigation} className="flex flex-col gap-1">
        <NavEntries
          entries={navigation.main}
          pathname={pathname}
          collapsed={collapsed}
        />
      </nav>

      <div className="flex-1" />

      {footerVisible ? (
        <div className="flex flex-col gap-1 border-t border-(--sidebar-border) pt-3">
          <NavEntries
            entries={footer}
            pathname={pathname}
            collapsed={collapsed}
          />
        </div>
      ) : null}
    </aside>
  );
}

function ProfileMenu({
  profile,
  actions,
  labels,
}: {
  profile: AppShellProfile;
  actions: AppShellMenuAction[];
  labels: Labels;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={labels.openProfileMenu}
          title={
            profile.subtitle
              ? `${profile.name} — ${profile.subtitle}`
              : profile.name
          }
          className="ml-1.5 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-card)"
        >
          <Avatar className="size-9 rounded-[10px] ring-1 ring-(--text-strong)/[0.05]">
            <AvatarFallback className="rounded-[10px] bg-(--brand-primary) text-[12.5px] font-bold text-(--text-inverse)">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[220px] rounded-xl border-(--border-soft)"
      >
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-semibold text-(--text-heading)">
            {profile.name}
          </p>
          {profile.subtitle ? (
            <p className="truncate text-xs text-(--text-muted)">
              {profile.subtitle}
            </p>
          ) : null}
        </div>
        {actions.length ? <DropdownMenuSeparator /> : null}
        {actions.map(({ label, icon: Icon, onSelect }) => (
          <DropdownMenuItem key={label} onSelect={onSelect}>
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The portal frame: top bar (brand, actions, profile menu), a sidebar whose
 * entries are filtered by the user's permissions, and the scrolling content
 * area. On narrow screens the sidebar opens from a menu button (AC-03.5).
 * Needs a `PermissionsProvider` above it.
 */
export function AppShell({
  brand,
  navigation,
  pathname,
  profile,
  profileActions = [],
  topBarActions,
  footer,
  collapsedStorageKey,
  defaultCollapsed,
  labels: labelOverrides,
  className,
  children,
}: AppShellProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div
      className={cn(
        "flex h-screen w-screen flex-col overflow-hidden bg-(--surface-canvas) text-foreground",
        className,
      )}
    >
      <header className="flex h-16 shrink-0 items-center gap-1 border-b border-(--border-soft) bg-(--surface-card) px-4 md:px-6">
        <div className="mr-2 flex h-full shrink-0 items-center border-r border-(--border-soft) pr-5 md:mr-3 md:pr-6">
          {brand}
        </div>
        <div className="flex-1" />
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {topBarActions}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <PortalButton
                  variant="outline"
                  size="icon"
                  aria-label={labels.openNavigation}
                >
                  <Menu className="size-4" aria-hidden />
                </PortalButton>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72.5 border-none bg-transparent p-0 shadow-none"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>{labels.navigationTitle}</SheetTitle>
                  <SheetDescription>{labels.openNavigation}</SheetDescription>
                </SheetHeader>
                <AppSidebar
                  navigation={navigation}
                  pathname={pathname}
                  collapsible={false}
                  labels={labels}
                  className="w-full"
                />
              </SheetContent>
            </Sheet>
          </div>
          {profile ? (
            <ProfileMenu
              profile={profile}
              actions={profileActions}
              labels={labels}
            />
          ) : null}
        </div>
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden shrink-0 md:flex">
          <AppSidebar
            navigation={navigation}
            pathname={pathname}
            collapsedStorageKey={collapsedStorageKey}
            defaultCollapsed={defaultCollapsed}
            labels={labels}
          />
        </div>
        {/* `relative` keeps hidden absolute elements (sr-only inputs, Radix's
            hidden native selects) inside this scroll container. */}
        <main className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-5">
          {children}
        </main>
      </div>
      {footer}
    </div>
  );
}

export interface NavRouteGuardProps {
  navigation: AppNavigation;
  pathname: string;
  /** Shown when the user lacks the page's permission. */
  denied?: ReactNode;
  /** Shown while permissions load. */
  loading?: ReactNode;
  children: ReactNode;
}

/**
 * Guards the current page with the permission of its navigation entry, the
 * same declaration that decides whether the entry is shown (AC-03.4). Pages
 * with no matching entry are not restricted by this guard.
 */
export function NavRouteGuard({
  navigation,
  pathname,
  denied,
  loading,
  children,
}: NavRouteGuardProps) {
  const entry = findNavEntry(navigation, pathname);
  return (
    <PermissionGuard
      require={entry?.permission}
      denied={denied}
      loading={loading}
    >
      {children}
    </PermissionGuard>
  );
}
