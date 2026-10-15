"use client";

import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

import { PortalDetailDefinitionRows } from "./portal-detail-definition-rows";
import type { PortalDetailField } from "./types";

export interface PortalDetailInfoSubsectionProps {
  /** Omit when the parent tab already uses this label (avoids duplicate headings). */
  title?: string;
  fields: PortalDetailField[];
  /** Use two-column field grid on md+ when there are few fields (e.g. emergency contact). */
  denseGrid?: boolean;
  labelAlign?: "start" | "end";
  /**
   * `inline` = section title column on the left, field rows to the right (Figma / onboarding mock).
   * `stacked` = title above fields (default for legacy drawers).
   */
  sectionTitleLayout?: "stacked" | "inline";
  className?: string;
  footer?: ReactNode;
}

/** Matches onboarding mock: narrow title column, fields start to the right. */
export const PORTAL_INLINE_SECTION_TITLE_CLASS =
  "w-36 shrink-0 pt-0.5 text-sm font-semibold leading-snug text-(--text-heading) sm:w-40";

export function PortalDetailInfoSubsection({
  title,
  fields,
  denseGrid,
  labelAlign,
  sectionTitleLayout = "stacked",
  className,
  footer,
}: PortalDetailInfoSubsectionProps) {
  const fieldsBlock = (
    <div className="min-w-0 w-full flex-1">
      <PortalDetailDefinitionRows
        fields={fields}
        denseGrid={denseGrid}
        labelAlign={labelAlign}
        className="w-full min-w-0"
      />
      {footer}
    </div>
  );

  if (sectionTitleLayout === "inline" && title) {
    return (
      <section
        className={cn(
          "flex w-full min-w-0 flex-row items-start gap-4 sm:gap-6",
          className,
        )}
      >
        <h4 className={PORTAL_INLINE_SECTION_TITLE_CLASS}>{title}</h4>
        {fieldsBlock}
      </section>
    );
  }

  return (
    <section className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      {title ? (
        <h4 className="text-sm font-semibold text-(--text-heading)">{title}</h4>
      ) : null}
      {fieldsBlock}
    </section>
  );
}
