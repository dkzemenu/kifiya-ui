"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { ReactNode, RefObject } from "react";

import { PortalButton } from "./portal-button";
import { cn } from "../lib/cn";
import { useRestoreFocus } from "../lib/use-restore-focus";

const ICON_TONE = {
  destructive: {
    Icon: AlertTriangle,
    iconClassName: "text-[var(--status-danger)]",
    badgeClassName:
      "bg-[color-mix(in_srgb,var(--status-danger)_12%,transparent)]",
  },
  success: {
    Icon: CheckCircle2,
    iconClassName: "text-[var(--status-success)]",
    badgeClassName:
      "bg-[color-mix(in_srgb,var(--status-success)_12%,transparent)]",
  },
  primary: {
    Icon: AlertTriangle,
    iconClassName: "text-[var(--brand-primary)]",
    badgeClassName:
      "bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)]",
  },
} as const;

export type PortalConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmVariant?: "destructive" | "primary" | "success";
  /** Shown below the description (e.g. API error, or a validation message from `children`). */
  error?: string | null;
  /** Extra content rendered between the description/error and the action buttons (e.g. a reason input). */
  children?: ReactNode;
  /**
   * Renders a dismiss (X) button in the top-right corner. Opt-in so that
   * existing confirm dialogs keep Cancel as their only dismiss affordance.
   */
  showCloseButton?: boolean;
  /**
   * When set, the dialog portals into this element and is centered over it
   * (the element should be `position: relative` and wrap the intended region).
   */
  anchorRef?: RefObject<HTMLElement | null>;
};

export function PortalConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
  confirmVariant = "destructive",
  error,
  children,
  showCloseButton = false,
  anchorRef,
}: PortalConfirmDialogProps) {
  const anchorEl = anchorRef?.current ?? null;
  const scoped = Boolean(anchorRef) && anchorEl != null;

  const overlayPosition = scoped ? "absolute" : "fixed";
  const shellPosition = scoped ? "absolute" : "fixed";
  const tone = ICON_TONE[confirmVariant];
  const restoreFocus = useRestoreFocus({});

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={scoped ? anchorEl : undefined}>
        <Dialog.Overlay
          className={cn(
            overlayPosition,
            "inset-0 z-50 bg-[color-mix(in_srgb,var(--text-heading)_45%,transparent)] backdrop-blur-[3px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 duration-200",
          )}
          onPointerDown={(event) => {
            if (isLoading) {
              event.preventDefault();
              return;
            }
            onOpenChange(false);
          }}
        />
        <Dialog.Content
          className={cn(
            shellPosition,
            "inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
            "border-0 bg-transparent p-0 shadow-none outline-none",
            "pointer-events-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 zoom-in-95 duration-200",
          )}
          onPointerDownOutside={(e) => {
            if (isLoading) {
              e.preventDefault();
            }
          }}
          {...restoreFocus}
          onEscapeKeyDown={(e) => {
            if (isLoading) {
              e.preventDefault();
            }
          }}
        >
          <div
            className={cn(
              "pointer-events-auto relative w-full max-w-md rounded-2xl border border-(--border-soft)",
              "bg-(--surface-canvas) p-6 shadow-[var(--shadow-overlay)]",
              "ring-1 ring-(--text-strong)/[0.05]",
              "max-h-[min(90vh,calc(100vh-2rem))] overflow-y-auto",
            )}
            role="presentation"
          >
            {showCloseButton ? (
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  disabled={isLoading}
                  className={cn(
                    "absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full",
                    "text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--text-strong)]",
                    "disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  <X className="size-4" aria-hidden />
                </button>
              </Dialog.Close>
            ) : null}
            <div className={cn("flex gap-4", showCloseButton && "pr-8")}>
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  tone.badgeClassName,
                )}
                aria-hidden
              >
                <tone.Icon
                  className={cn("size-5", tone.iconClassName)}
                  strokeWidth={2}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <Dialog.Title className="text-base font-semibold tracking-tight text-(--text-heading)">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="text-sm leading-relaxed text-(--text-muted)">
                  {description}
                </Dialog.Description>
              </div>
            </div>
            {children ? <div className="mt-4">{children}</div> : null}
            {error ? (
              <p
                className="mt-4 rounded-(--radius-control) border border-[var(--status-danger)]/30 bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--status-danger)]"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
              <PortalButton
                type="button"
                variant="outline"
                className="h-10"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                {cancelLabel}
              </PortalButton>
              <PortalButton
                type="button"
                variant={confirmVariant}
                className="h-10"
                loading={isLoading}
                onClick={() => onConfirm()}
              >
                {confirmLabel}
              </PortalButton>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
