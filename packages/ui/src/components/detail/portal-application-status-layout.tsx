"use client";

import { FileText } from "lucide-react";

import { PageSectionCard } from "../page-section-card";
import { PortalStatusChip } from "../portal-status-chip";
import type { PortalChipProps } from "../portal-status-chip";

export interface PortalApplicationVerificationCheck {
  id: string;
  label: string;
  badgeLabel: string;
  tone?: PortalChipProps["tone"];
}

export interface PortalApplicationStatusSplit {
  fraudEngineBadgeLabel: string;
  fraudEngineTone: NonNullable<PortalChipProps["tone"]>;
  verificationChecks: PortalApplicationVerificationCheck[];
}

export interface PortalApplicationStatusLayoutProps {
  split: PortalApplicationStatusSplit;
}

export function PortalApplicationStatusLayout({
  split,
}: PortalApplicationStatusLayoutProps) {
  return (
    <PageSectionCard
      className="w-full min-w-0 max-w-none"
      title="Fraud Engine & Compliance"
      contentClassName="w-full min-w-0 space-y-6 pb-6 pt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-(--text-body)">Fraud Engine Result</span>
        <PortalStatusChip
          label={split.fraudEngineBadgeLabel}
          tone={split.fraudEngineTone}
          className="shrink-0 mr-6 rounded-(--radius-input)!"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-(--text-heading)">
          Verification Checks
        </h3>
        <ul className="space-y-3" role="list">
          {split.verificationChecks.map((check) => (
            <li key={check.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-(--radius-card) border border-(--border-soft) px-4 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <FileText
                    className="size-5 shrink-0 text-(--text-muted)"
                    aria-hidden
                  />
                  <span className="text-sm text-(--text-heading)">
                    {check.label}
                  </span>
                </span>
                <PortalStatusChip
                  label={check.badgeLabel}
                  tone={check.tone ?? "success"}
                  className="shrink-0 rounded-(--radius-input)!"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageSectionCard>
  );
}
