"use client";

import { Fragment, type ReactNode } from "react";

import { PortalStatusChip } from "../portal-status-chip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../primitives/card";
import { cn } from "../../lib/cn";

import type { PortalDetailHeader } from "./types";

export type PortalDetailPanelShellProps = {
  header: PortalDetailHeader;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PortalDetailPanelShell({
  header,
  children,
  actions,
  className,
}: PortalDetailPanelShellProps) {
  return (
    <Card className={cn("min-w-0 max-w-full", className)}>
      <CardHeader className="space-y-3 border-b border-(--border-soft) px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle className="wrap-break-word text-lg font-semibold text-(--text-heading)">
              {header.title}
            </CardTitle>
            {header.subtitle ? (
              <div className="min-w-0 wrap-break-word text-xs text-(--text-muted)">
                {header.subtitle}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {header.badges?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {header.badges.map((badge) => (
                  <PortalStatusChip
                    key={badge.label}
                    label={badge.label}
                    tone={badge.tone}
                    className="rounded-(--radius-input)!"
                  />
                ))}
              </div>
            ) : null}

            {actions}
          </div>
        </div>

        {header.meta?.length ? (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {header.meta.map((item) => (
              <Fragment key={item.label}>
                <dt className="text-(--text-muted)">{item.label}:</dt>
                <dd className="font-medium text-(--text-heading)">
                  {item.value}
                </dd>
              </Fragment>
            ))}
          </dl>
        ) : null}
      </CardHeader>

      <CardContent className="min-w-0 space-y-5 px-4 pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
