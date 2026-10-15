import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

const toneClasses = {
  neutral: "bg-[var(--surface-muted)] text-[var(--text-strong)]",
  card: "border border-[var(--border-soft)] bg-[var(--surface-card)] text-[var(--text-strong)] shadow-[var(--shadow-xs)]",
  brand: "bg-[var(--brand-primary)] text-[var(--text-inverse)]",
  success:
    "bg-[color:color-mix(in_srgb,var(--status-success)_12%,var(--surface-card))] text-[var(--text-strong)]",
  warning:
    "bg-[color:color-mix(in_srgb,var(--status-warning)_16%,var(--surface-card))] text-[var(--text-strong)]",
  danger:
    "bg-[color:color-mix(in_srgb,var(--status-danger)_12%,var(--surface-card))] text-[var(--text-strong)]",
} as const;

const deltaToneClasses = {
  positive: "text-[var(--status-success)]",
  negative: "text-[var(--status-danger)]",
  neutral: "text-[var(--text-subtle)]",
} as const;

export type PortalStatCardProps = {
  label: string;
  value: string;
  delta?: string;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: keyof typeof toneClasses;
  /** Colors the trend line when `tone` is `neutral` or `card`. */
  deltaTone?: keyof typeof deltaToneClasses;
  /**
   * Dashboard-style KPI: dark icon tile with white glyph (matches reference mocks).
   * Default keeps existing brand/neutral icon treatment.
   */
  iconVariant?: "default" | "charcoal";
  iconClassName?: string;
  /** Slightly smaller card for dense overview rows. */
  size?: "default" | "compact";
  className?: string;
};

export function PortalStatCard({
  label,
  value,
  delta,
  subtitle,
  icon: Icon,
  tone = "neutral",
  deltaTone = "neutral",
  iconVariant = "default",
  iconClassName,
  size = "default",
  className,
}: PortalStatCardProps) {
  const inverse = tone === "brand";
  const isCardTone = tone === "card";
  const isCompact = size === "compact";

  const iconWrapperClass =
    iconVariant === "charcoal"
      ? cn(
          "flex shrink-0 items-center justify-center rounded-[10px] bg-[var(--stat-icon-bg)] text-[var(--text-inverse)] shadow-[var(--stat-icon-shadow)]",
          isCompact ? "size-9" : "size-10",
        )
      : cn(
          "flex shrink-0 items-center justify-center rounded-xl",
          isCompact ? "size-9" : "size-10",
          inverse
            ? "bg-(--text-inverse)/15 text-(--text-inverse)"
            : tone === "card"
              ? "bg-[var(--brand-secondary)] text-[var(--text-inverse)]"
              : "bg-(--border-strong) text-(--text-heading)",
        );

  return (
    <div
      className={cn(
        "@container w-full min-w-0 rounded-[14px] shadow-none",
        isCardTone
          ? isCompact
            ? "px-3.5 py-4 sm:px-5 sm:py-5"
            : "px-4 py-5 sm:px-6 sm:py-7"
          : isCompact
            ? "px-3.5 py-4 sm:px-4 sm:py-5"
            : "px-4 py-5 sm:px-5 sm:py-6",
        toneClasses[tone],
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-start justify-between",
          isCompact ? "gap-2.5 sm:gap-3" : "gap-3 sm:gap-4",
        )}
      >
        <p
          className={cn(
            "min-w-0 flex-1 pr-2 font-medium leading-snug wrap-break-word",
            isCompact ? "text-sm" : "text-[15px]",
            inverse
              ? "text-(--text-inverse)"
              : isCardTone
                ? "text-(--text-subtle)"
                : "text-(--text-strong)",
          )}
        >
          {label}
        </p>
        {Icon ? (
          <div className={cn(iconWrapperClass, iconClassName)}>
            <Icon
              className={isCompact ? "size-4" : "size-4.5"}
              strokeWidth={1.75}
            />
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          "min-w-0",
          isCardTone
            ? isCompact
              ? "mt-4 sm:mt-5"
              : "mt-5 sm:mt-6"
            : isCompact
              ? "mt-2.5 sm:mt-3"
              : "mt-3 sm:mt-4",
        )}
      >
        <div className="flex min-w-0 flex-col items-start gap-y-1.5 @[17rem]:flex-row @[17rem]:flex-wrap @[17rem]:items-baseline @[17rem]:gap-x-2.5 @[17rem]:gap-y-1">
          <span
            className={cn(
              "k-stat-metric-value shrink-0 leading-tight tabular-nums",
              isCompact
                ? "text-[clamp(1.125rem,4vw,1.4rem)]"
                : "text-[clamp(1.25rem,4.5vw,1.559rem)]",
              inverse ? "text-(--text-inverse)" : "text-(--text-strong)",
            )}
          >
            {value}
          </span>
          {subtitle ? (
            <span
              className={cn(
                "shrink-0 text-sm font-medium leading-snug @[17rem]:max-w-none",
                inverse ? "text-(--text-inverse)/80" : "text-(--text-subtle)",
              )}
            >
              {subtitle}
            </span>
          ) : delta ? (
            <span
              className={cn(
                "shrink-0 text-sm font-medium leading-snug tracking-normal tabular-nums",
                inverse
                  ? "text-(--text-inverse)/90"
                  : tone === "card" || tone === "neutral"
                    ? deltaToneClasses[deltaTone]
                    : "text-(--text-strong)",
              )}
            >
              {delta}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
