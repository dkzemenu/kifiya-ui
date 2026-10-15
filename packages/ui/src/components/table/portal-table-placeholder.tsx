"use client";

import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export function PortalTablePlaceholder({
  placeholder,
  tone = "empty",
}: {
  placeholder: ReactNode;
  /** `error` announces the message to assistive technology and uses the danger tone. */
  tone?: "empty" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex min-h-52 items-center justify-center text-sm",
        tone === "error"
          ? "text-(--status-danger-strong)"
          : "text-(--text-muted)",
      )}
    >
      {placeholder}
    </div>
  );
}
