"use client";

import * as React from "react";

import { cn } from "../lib/cn";

export type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "onClick"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { className, checked = false, onCheckedChange, disabled, type, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type ?? "button"}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--brand-primary)_35%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-card) disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-(--brand-primary)" : "bg-(--border-muted)",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-(--surface-card) shadow-sm ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  ),
);
Switch.displayName = "Switch";

export { Switch };
