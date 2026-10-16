import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type EmptyStateProps = {
  /** What is empty, e.g. "No agents yet". */
  title: string;
  /** Why it is empty, or what to do next. */
  description?: ReactNode;
  icon?: LucideIcon;
  /** A next step, e.g. a button that creates the first record. */
  action?: ReactNode;
  /** `compact` for an empty table body or a small card. */
  size?: "default" | "compact";
  className?: string;
};

/**
 * What a list, table or section shows when it has nothing in it. The copy
 * comes from the app: say what is missing and what to do about it.
 */
export function EmptyState({
  title,
  description,
  icon: Glyph,
  action,
  size = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "compact" ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
        className,
      )}
    >
      {Glyph ? (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-(--surface-muted) text-(--text-muted)",
            size === "compact" ? "size-10" : "size-12",
          )}
        >
          <Glyph
            className={size === "compact" ? "size-5" : "size-6"}
            aria-hidden
          />
        </span>
      ) : null}
      <p
        className={cn(
          "font-semibold text-(--text-heading)",
          size === "compact" ? "text-sm" : "text-base",
        )}
      >
        {title}
      </p>
      {description ? (
        <div className="max-w-md text-sm text-(--text-subtle)">
          {description}
        </div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
