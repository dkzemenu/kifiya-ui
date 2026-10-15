"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";
import { useLinkComponent } from "../provider";

export type PortalSidebarItemProps = {
  /** Omit to render a disabled, non-navigating item. */
  href?: string;
  label: string;
  icon: LucideIcon;
  /** Whether this item is the current page. The app decides; the kit has no router. */
  active?: boolean;
  disabled?: boolean;
  /** Count shown at the end of the row (e.g. pending items). Hidden when 0 or collapsed. */
  badgeCount?: number;
  /** Icon-only rail mode: label hidden visually, kept for screen readers and as a tooltip. */
  collapsed?: boolean;
  className?: string;
};

/**
 * One row in the app sidebar. Styled from the `--sidebar-*` tokens, matching
 * the agent-frontend app shell.
 */
export function PortalSidebarNavItem({
  href,
  label,
  icon: Icon,
  active = false,
  disabled = false,
  badgeCount,
  collapsed = false,
  className,
}: PortalSidebarItemProps) {
  const Link = useLinkComponent();
  const isDisabled = disabled || !href;
  const isActive = active && !isDisabled;

  const classes = cn(
    "group relative flex h-10 w-full items-center rounded-[10px] text-left transition-[color,background-color] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--sidebar-bg)",
    collapsed ? "justify-center px-0" : "gap-3 px-3",
    isDisabled
      ? "cursor-default text-(--text-faint)"
      : isActive
        ? "bg-(--brand-primary-soft) font-semibold text-(--text-heading)"
        : "font-medium text-(--sidebar-text) hover:bg-(--sidebar-hover) hover:text-(--sidebar-heading)",
    className,
  );

  const content = (
    <>
      {isActive ? (
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-(--brand-primary)",
            collapsed && "left-[3px]",
          )}
        />
      ) : null}
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          isActive && "text-(--brand-primary)",
        )}
        strokeWidth={isActive ? 2 : 1.75}
        aria-hidden
      />
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="min-w-0 flex-1 truncate text-[13px] leading-none">
          {label}
        </span>
      )}
      {!collapsed && badgeCount ? (
        <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-(--sidebar-count-bg) px-1.5 text-[11px] font-semibold leading-none text-(--sidebar-count-text)">
          {badgeCount}
        </span>
      ) : null}
    </>
  );

  if (isDisabled || !href) {
    return (
      <div
        className={classes}
        aria-disabled="true"
        title={collapsed ? label : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      {content}
    </Link>
  );
}
