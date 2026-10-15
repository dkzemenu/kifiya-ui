import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

const toneClasses = {
  success:
    "border-[color:color-mix(in_srgb,var(--status-success)_20%,var(--surface-card))] bg-[var(--status-success-soft)] text-[var(--status-success-strong)]",
  warning:
    "border-[color:color-mix(in_srgb,var(--status-warning)_28%,var(--surface-card))] bg-[var(--status-warning-soft)] text-[var(--status-warning-strong)]",
  danger:
    "border-[color:color-mix(in_srgb,var(--status-danger)_18%,var(--surface-card))] bg-[var(--status-danger-soft)] text-[var(--status-danger-strong)]",
  neutral:
    "border-[var(--border-soft)] bg-[var(--status-neutral-soft)] text-[var(--text-body)]",
  processing:
    "border-[color:color-mix(in_srgb,var(--status-processing)_18%,var(--surface-card))] bg-[var(--status-processing-soft)] text-[var(--status-processing)]",
} as const;

export type PortalChipProps = {
  label: string;
  tone?: keyof typeof toneClasses;
  icon?: LucideIcon;
  className?: string;
};

export function PortalStatusChip({
  label,
  tone = "neutral",
  icon: Icon,
  className,
}: PortalChipProps) {
  return (
    <span
      className={cn(
        "k-status-chip inline-flex items-center gap-2 whitespace-nowrap px-3 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      <span>{label}</span>
    </span>
  );
}
