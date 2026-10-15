import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "../lib/cn";

function Input({
  className,
  type,
  leadingIcon,
  ...props
}: React.ComponentProps<"input"> & {
  leadingIcon?: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      {leadingIcon ? (
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-(--text-placeholder)">
          {leadingIcon}
        </span>
      ) : null}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-11 w-full rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card) px-4 py-2 text-sm text-(--text-strong) shadow-none outline-none transition-colors placeholder:text-(--text-placeholder) focus-visible:border-(--brand-primary) focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
          leadingIcon ? "pl-11" : "",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function SearchInput(props: React.ComponentProps<"input">) {
  return <Input leadingIcon={<Search className="size-4" />} {...props} />;
}

export { Input, SearchInput };
