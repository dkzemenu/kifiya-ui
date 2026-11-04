"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { forwardRef, type ReactNode } from "react";

import { cn } from "../lib/cn";

const TONES = {
  info: {
    Icon: Info,
    className:
      "border-[color-mix(in_srgb,var(--status-processing)_30%,transparent)] bg-(--status-processing-soft) text-(--text-strong)",
    iconClassName: "text-(--status-processing)",
  },
  success: {
    Icon: CheckCircle2,
    className:
      "border-[color-mix(in_srgb,var(--status-success)_30%,transparent)] bg-(--status-success-soft) text-(--status-success-strong)",
    iconClassName: "text-(--status-success)",
  },
  warning: {
    Icon: TriangleAlert,
    className:
      "border-[color-mix(in_srgb,var(--status-warning)_35%,transparent)] bg-(--status-warning-soft) text-(--status-warning-strong)",
    iconClassName: "text-(--status-warning)",
  },
  danger: {
    Icon: AlertCircle,
    className:
      "border-(--status-danger) bg-(--status-danger-soft) text-(--status-danger-strong)",
    iconClassName: "text-(--status-danger)",
  },
} as const;

export type BannerTone = keyof typeof TONES;

export type BannerProps = {
  tone?: BannerTone;
  /** A short title (three or four words), e.g. "Bank link failed". */
  title?: ReactNode;
  /** What happened and what to do next. The app's copy, never an error's own text. */
  children?: ReactNode;
  /** A follow-up, e.g. a "Retry" button. */
  action?: ReactNode;
  /** Shows a dismiss button. Leave it out for messages that must stay until fixed. */
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
};

/**
 * A page- or section-level message that stays until it is resolved or
 * dismissed: a failed load, a degraded service, a read-only notice. `danger`
 * is announced at once (`role="alert"`); the others politely.
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    tone = "info",
    title,
    children,
    action,
    onDismiss,
    dismissLabel = "Dismiss",
    className,
  },
  ref,
) {
  const { Icon, className: toneClassName, iconClassName } = TONES[tone];
  return (
    <div
      ref={ref}
      data-slot="banner"
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
      tabIndex={-1}
      className={cn(
        "flex items-start gap-3 rounded-(--radius-control) border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)",
        toneClassName,
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", iconClassName)}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div>{children}</div> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="-m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-(--brand-primary) focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
});
