"use client";

import { cn } from "../../lib/cn";

import type { PortalDetailField } from "./types";

export interface PortalDetailTwoColumnStackedGridProps {
  /**
   * Fields in **row order**: index 0 & 1 = first row (left, right), 2 & 3 = second row, etc.
   * Odd length: last row only renders the left cell.
   * Each cell renders **label and value on one horizontal line** (onboarding design).
   */
  fields: PortalDetailField[];
  className?: string;
}

function InlineFieldCell({ field }: { field: PortalDetailField }) {
  return (
    <div className="flex min-w-0 flex-nowrap flex-row items-baseline gap-x-3 sm:gap-x-4">
      <div className="w-36 shrink-0 text-xs leading-snug text-(--text-muted) sm:w-44">
        {field.label}
      </div>
      <div className="min-w-0 flex-1 text-sm font-semibold leading-snug wrap-break-word text-(--text-heading)">
        {field.value}
      </div>
    </div>
  );
}

export function PortalDetailTwoColumnStackedGrid({
  fields,
  className,
}: PortalDetailTwoColumnStackedGridProps) {
  const rows: Array<{ left: PortalDetailField; right?: PortalDetailField }> =
    [];
  for (let i = 0; i < fields.length; i += 2) {
    const left = fields[i];
    if (!left) {
      continue;
    }
    rows.push({ left, right: fields[i + 1] });
  }

  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-6 sm:gap-7", className)}
    >
      {rows.map((row, index) => (
        <div
          key={`${row.left.label}-${index}`}
          className="grid w-full min-w-0 grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 sm:gap-y-0 sm:gap-x-8 lg:gap-x-12"
        >
          <InlineFieldCell field={row.left} />
          {row.right ? (
            <InlineFieldCell field={row.right} />
          ) : (
            <div className="min-w-0" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
