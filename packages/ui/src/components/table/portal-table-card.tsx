"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../primitives/card";
import { PortalTable } from "./portal-table";
import type { PortalTableCardProps } from "./types";

export function PortalTableCard<T>({
  title,
  description,
  headerAction,
  footerContent,
  ...tableProps
}: PortalTableCardProps<T>) {
  return (
    <Card className="min-w-0 rounded-(--radius-card) py-0">
      <CardHeader className="flex flex-col gap-4 px-6 pt-6 pb-0 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="k-title">{title}</CardTitle>
          {description ? (
            <CardDescription className="k-subtitle mt-1">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </CardHeader>

      <CardContent className="min-w-0 px-0 pt-4 pb-0">
        <PortalTable {...tableProps} />
        {footerContent ? (
          <div className="border-t border-(--border-soft) px-5 py-4">
            {footerContent}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
