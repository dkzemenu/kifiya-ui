"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../primitives/sheet";
import { cn } from "../lib/cn";

export type PortalDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Shown in an orange rounded square (pass a Lucide icon at ~size-5). */
  icon?: ReactNode;
  children: ReactNode;
  /** Sticky footer, typically action buttons */
  footer?: ReactNode;
  /** `default` ~24rem, `wide` ~32rem (roughly one-third of large viewports). */
  size?: "default" | "wide";
  className?: string;
  /** Applied to the sticky title/description strip below the sheet close control. */
  headerClassName?: string;
};

export function PortalDrawer({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  size = "default",
  className,
  headerClassName,
}: PortalDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          // Override base `sheet` right variant: full viewport height, ~35–40% width on desktop.
          "fixed inset-y-0 right-0 left-auto flex flex-col gap-0 overflow-hidden p-0",
          "h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full max-w-none",
          "rounded-none border-y-0 border-r-0 border-l border-(--border-soft) bg-(--surface-canvas)",
          "shadow-[var(--shadow-drawer)]",
          size === "wide"
            ? "sm:w-[min(40vw,36rem)] sm:min-w-[20rem]"
            : "sm:w-[min(40vw,28rem)] sm:min-w-[18rem]",
          className,
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-start gap-3 border-b border-(--border-soft) px-6 pt-6 pb-4 pr-14",
            headerClassName,
          )}
        >
          {icon ? (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--brand-primary) text-(--text-inverse) shadow-sm">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            <SheetTitle className="text-left text-xl font-semibold tracking-tight text-(--text-heading)">
              {title}
            </SheetTitle>
            {description ? (
              <SheetDescription className="text-left text-sm text-(--text-muted)">
                {description}
              </SheetDescription>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer ? (
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-(--border-soft) bg-(--surface-canvas) px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
