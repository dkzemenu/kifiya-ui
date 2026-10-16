import * as React from "react";

import { cn } from "../lib/cn";

/** A multi-line text input, styled like `Input`. `aria-invalid` shows the error style. */
function Textarea({
  className,
  rows = 4,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(
        "flex w-full rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card) px-4 py-3 text-sm text-(--text-strong) shadow-none outline-none transition-colors placeholder:text-(--text-placeholder) focus-visible:border-(--brand-primary) focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-(--status-danger)",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
