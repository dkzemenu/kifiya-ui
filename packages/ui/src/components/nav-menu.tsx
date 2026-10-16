"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";
import { useLinkComponent } from "../provider";

export type NavMenuItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  /** Overrides the match against `currentPath`, e.g. for a section with several roots. */
  active?: boolean;
  /** A small count shown after the label, e.g. pending reviews. */
  count?: number;
};

export type NavMenuProps = {
  items: NavMenuItem[];
  /** The app's current path; the item whose `href` it is in is marked current. */
  currentPath?: string;
  /** Names the navigation landmark, e.g. "Sections". */
  "aria-label": string;
  className?: string;
};

/** Whether `path` is `href` or a page under it (`/agents` matches `/agents/42`). */
function matches(path: string | undefined, href: string): boolean {
  if (!path) return false;
  const clean = (value: string) =>
    value.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
  const current = clean(path);
  const target = clean(href);
  return (
    current === target || (target !== "/" && current.startsWith(`${target}/`))
  );
}

/**
 * Horizontal navigation for the top of a page or section. Links render
 * through the app's link component (`KifiyaUIProvider`); the current entry is
 * marked with `aria-current="page"`.
 */
export function NavMenu({
  items,
  currentPath,
  className,
  "aria-label": ariaLabel,
}: NavMenuProps) {
  const Link = useLinkComponent();
  return (
    <nav
      data-slot="nav-menu"
      aria-label={ariaLabel}
      className={cn("overflow-x-auto", className)}
    >
      <ul className="flex min-w-max items-center gap-1 border-b border-(--border-soft)">
        {items.map((item) => {
          const active = item.active ?? matches(currentPath, item.href);
          const Glyph = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)",
                  active
                    ? "border-(--brand-primary) text-(--brand-primary)"
                    : "border-transparent text-(--text-subtle) hover:border-(--border-strong) hover:text-(--text-strong)",
                )}
              >
                {Glyph ? <Glyph className="size-4" aria-hidden /> : null}
                {item.label}
                {item.count != null ? (
                  <span
                    className={cn(
                      "rounded-(--radius-pill) px-2 py-0.5 text-xs",
                      active
                        ? "bg-(--brand-primary-soft) text-(--brand-primary)"
                        : "bg-(--surface-muted) text-(--text-subtle)",
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
