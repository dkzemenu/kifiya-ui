"use client";

import type { PortalDetailField } from "./types";

export interface PortalDetailRowsSectionProps {
  title: string;
  rows: PortalDetailField[];
}

/**
 * Label-left / value-right divided rows under a section heading, used for
 * read-only detail drawers (e.g. transaction detail, commission structure view).
 */
export function PortalDetailRowsSection({
  title,
  rows,
}: PortalDetailRowsSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-(--text-heading)">{title}</h3>
      <div className="divide-y divide-(--border-soft) border-y border-(--border-soft)">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3 first:pt-3 last:pb-3"
          >
            <span className="shrink-0 text-sm text-(--text-muted)">
              {row.label}
            </span>
            <div className="flex min-w-0 flex-1 justify-end text-sm font-semibold text-(--text-heading)">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
