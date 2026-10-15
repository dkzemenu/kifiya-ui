import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../primitives/card";
import { cn } from "../lib/cn";

export type PageSectionCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageSectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: PageSectionCardProps) {
  return (
    <Card
      className={cn(
        "min-w-0 max-w-full gap-0 rounded-(--radius-panel) py-0",
        className,
      )}
    >
      {title || description || action ? (
        <CardHeader className="flex flex-col gap-4 px-6 py-3! pb-0 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title ? <CardTitle className="k-title">{title}</CardTitle> : null}
            {description ? (
              <CardDescription className="k-subtitle mt-1">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action}
        </CardHeader>
      ) : null}
      <CardContent className={cn("min-w-0 px-6 pt-6 pb-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
