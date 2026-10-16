"use client";

import { cn } from "../../lib/cn";

import type { PortalDetailField } from "./types";

export interface PortalDetailDefinitionRowsProps {
  fields: PortalDetailField[];
  /** When true, fields fill a 2-column grid on md+ (e.g. short emergency-contact rows). */
  denseGrid?: boolean;
  /** `start` matches detail-panel mockups (label left); `end` keeps legacy label-right alignment. */
  labelAlign?: "start" | "end";
  /** `divided` matches customer onboarding review rows with horizontal separators. */
  variant?: "default" | "divided";
  className?: string;
}

export function PortalDetailDefinitionRows({
  fields,
  denseGrid,
  labelAlign = "end",
  variant = "default",
  className,
}: PortalDetailDefinitionRowsProps) {
  // Columns follow the width the rows actually have (a container query), not
  // the window: the same section reads well on a page and in a drawer.
  if (variant === "divided") {
    return (
      <div className="@container min-w-0">
        <dl
          className={cn("min-w-0 divide-y divide-(--border-soft)", className)}
        >
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-1 gap-1 py-4 first:pt-0 last:pb-0 @md:grid-cols-2 @md:items-center @md:gap-x-10"
            >
              <dt className="text-left text-sm text-(--text-muted)">
                {field.label}
              </dt>
              <dd className="min-w-0 text-left text-sm font-semibold text-(--text-heading)">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  /**
   * Flex (not grid) so the value column always gets `flex-1 min-w-0` and can wrap.
   * Nested grid + side-by-side sections previously collapsed the `1fr` track to ~0 width.
   * Always `flex-row` so label and value stay on one line like the design (value may wrap).
   */
  const rowClassName =
    "flex w-full min-w-0 flex-nowrap flex-row items-baseline gap-x-3 @md:gap-x-4";

  const dtClassName =
    labelAlign === "start"
      ? "w-32 shrink-0 text-start text-xs leading-snug text-(--text-muted) @md:w-44"
      : "w-32 max-w-[42%] shrink-0 text-end text-xs leading-snug text-(--text-muted) @md:w-40 @md:max-w-none";

  return (
    <div className="@container min-w-0">
      <dl
        className={
          denseGrid
            ? `grid grid-cols-1 gap-x-8 gap-y-3 @2xl:grid-cols-2 ${className ?? ""}`.trim()
            : `space-y-3 ${className ?? ""}`.trim()
        }
      >
        {fields.map((field) => (
          <div key={field.label} className={rowClassName}>
            <dt className={dtClassName}>{field.label}</dt>
            <dd className="min-w-0 flex-1 text-sm font-semibold leading-snug wrap-break-word text-(--text-heading)">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
