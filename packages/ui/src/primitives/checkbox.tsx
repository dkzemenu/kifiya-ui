"use client";

import type { ButtonHTMLAttributes } from "react";
import { Check } from "lucide-react";

import { cn } from "../lib/cn";

export function Checkbox({
  checked = false,
  onCheckedChange,
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
      className={cn(
        "flex size-[18px] items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--text-inverse)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--brand-primary)_30%,transparent)]",
        checked && "border-[var(--brand-primary)] bg-[var(--brand-primary)]",
        className,
      )}
    >
      <Check className={cn("size-3", checked ? "opacity-100" : "opacity-0")} />
    </button>
  );
}
