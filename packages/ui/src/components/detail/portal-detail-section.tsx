"use client";

import { PageSectionCard } from "../page-section-card";

import { PortalDetailDefinitionRows } from "./portal-detail-definition-rows";
import type { PortalDetailSectionGroup } from "./types";

export interface PortalDetailSectionProps {
  /** Omit when the parent tab label already names this section (avoids duplicate headings). */
  title?: string;
  groups: PortalDetailSectionGroup[];
  /** Skip the card wrapper — use when the parent panel (e.g. a stepper tab) already provides one. */
  bare?: boolean;
  /** `default` dense grid rows; `divided` horizontal-divider rows (matches customer onboarding tabs). */
  rowVariant?: "default" | "divided";
}

export function PortalDetailSection({
  title,
  groups,
  bare = false,
  rowVariant = "default",
}: PortalDetailSectionProps) {
  const content = (
    <div className="space-y-6">
      {groups.map((group, index) => (
        <section
          key={`${group.title ?? "group"}-${index}`}
          className="space-y-3"
        >
          {group.title ? (
            <h4 className="text-sm font-semibold text-[var(--text-heading)]">
              {group.title}
            </h4>
          ) : null}
          <PortalDetailDefinitionRows
            denseGrid={rowVariant === "default"}
            variant={rowVariant}
            labelAlign="start"
            fields={group.fields}
          />
        </section>
      ))}
    </div>
  );

  if (bare) {
    return content;
  }

  return <PageSectionCard title={title}>{content}</PageSectionCard>;
}
