"use client";

import type { ReactNode } from "react";

import { PageSectionCard } from "../page-section-card";

import { PortalDetailInfoSubsection } from "./portal-detail-info-subsection";
import { PortalDetailTwoColumnStackedGrid } from "./portal-detail-two-column-stacked-grid";
import type { PortalDetailField } from "./types";

const sectionTitleClass = "text-sm font-semibold text-(--text-heading)";

export interface PortalPersonalInformationSplit {
  /** Row-major pairs for the two-column stacked grid: [left, right, left, right, …]. */
  personal: PortalDetailField[];
  address: PortalDetailField[];
  emergency: PortalDetailField[];
}

export interface PortalBusinessInformationSplit {
  business: PortalDetailField[];
  businessAddress: PortalDetailField[];
  financial: PortalDetailField[];
}

export interface PortalPersonalInformationLayoutProps {
  split: PortalPersonalInformationSplit;
  /** When set, notes render inside the same card below a divider (Figma-style). */
  reviewNotesSlot?: ReactNode;
}

export function PortalPersonalInformationLayout({
  split,
  reviewNotesSlot,
}: PortalPersonalInformationLayoutProps) {
  return (
    <PageSectionCard
      className="w-full min-w-0 max-w-none border border-(--border-soft) bg-(--surface-subtle) shadow-none"
      contentClassName="w-full min-w-0 space-y-8 px-5 pb-6 pt-6 sm:px-6"
    >
      {/*
        Onboarding mock: 50/50 grid per section; each cell is label + value on one line;
        each grid row is [left field | right field]. Sections stack vertically.
      */}
      <div className="flex w-full min-w-0 flex-col gap-8 sm:gap-10">
        <section className="min-w-0" aria-label="Personal details">
          <PortalDetailTwoColumnStackedGrid fields={split.personal} />
        </section>

        <section className="min-w-0 space-y-3">
          <h4 className={sectionTitleClass}>Address</h4>
          <PortalDetailTwoColumnStackedGrid fields={split.address} />
        </section>

        <section className="min-w-0 space-y-3">
          <h4 className={sectionTitleClass}>Emergency Contact</h4>
          <PortalDetailTwoColumnStackedGrid fields={split.emergency} />
        </section>
      </div>

      {reviewNotesSlot ? (
        <>
          <div
            className="border-t border-(--border-soft) pt-6"
            role="presentation"
          />
          {reviewNotesSlot}
        </>
      ) : null}
    </PageSectionCard>
  );
}

export interface PortalBusinessInformationLayoutProps {
  split: PortalBusinessInformationSplit;
  reviewNotesSlot?: ReactNode;
}

/** Same building blocks as personal tab: top row (business | address), financial block, optional embedded notes. */
export function PortalBusinessInformationLayout({
  split,
  reviewNotesSlot,
}: PortalBusinessInformationLayoutProps) {
  return (
    <PageSectionCard
      className="w-full min-w-0 max-w-none"
      contentClassName="w-full min-w-0 space-y-8 pb-6 pt-6"
    >
      <div className="grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-6 lg:gap-8">
        <PortalDetailInfoSubsection
          className="min-w-0"
          title="Business Information"
          fields={split.business}
        />
        <PortalDetailInfoSubsection
          className="min-w-0"
          title="Address"
          fields={split.businessAddress}
        />
      </div>

      <div className="border-t border-(--border-soft) pt-8">
        <PortalDetailInfoSubsection
          title="Financial Information"
          fields={split.financial}
        />
      </div>

      {reviewNotesSlot ? (
        <>
          <div
            className="border-t border-(--border-soft) pt-6"
            role="presentation"
          />
          {reviewNotesSlot}
        </>
      ) : null}
    </PageSectionCard>
  );
}
