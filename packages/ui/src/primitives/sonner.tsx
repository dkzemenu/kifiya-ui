"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Shows a toast through the mounted `<Toaster />`. Re-exported so apps need no direct sonner dependency. */
export { toast } from "sonner";

/**
 * Toast host. Pass `theme` from the app's theme state (e.g. next-themes'
 * `resolvedTheme`); it defaults to `"system"`.
 */
export function Toaster({ theme = "system", ...props }: ToasterProps) {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-(--radius-control) border border-(--border-soft) bg-(--surface-card) text-(--text-heading) shadow-[var(--shadow-overlay)]",
          description: "text-(--text-muted)",
          actionButton: "bg-(--brand-primary) text-(--text-inverse)",
          cancelButton: "bg-(--surface-muted) text-(--text-muted)",
          success:
            "border-[color-mix(in_srgb,var(--status-success)_35%,transparent)] bg-(--status-success-soft) text-(--text-heading) [&_[data-icon]]:text-(--status-success-strong)",
          error:
            "border-[color-mix(in_srgb,var(--status-danger)_35%,transparent)] bg-(--status-danger-soft) text-(--text-heading) [&_[data-icon]]:text-(--status-danger)",
        },
      }}
      {...props}
    />
  );
}
