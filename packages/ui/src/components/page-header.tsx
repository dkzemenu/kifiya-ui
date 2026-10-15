"use client";

import type { ReactNode } from "react";

import { SearchInput } from "../primitives/input";
import { cn } from "../lib/cn";

export type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  mobileNavigation?: ReactNode;
  filterSlot?: ReactNode;
  actions?: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  mobileNavigation,
  filterSlot,
  actions,
  showSearch = false,
  searchPlaceholder = "Search",
  onSearch,
  className,
}: PageHeaderProps) {
  const shouldRenderSearch = showSearch || Boolean(onSearch);
  const shouldRenderFiltersRow = shouldRenderSearch || Boolean(filterSlot);

  return (
    <section
      className={cn(
        "k-card k-page-header sticky top-4 z-20 overflow-hidden rounded-(--radius-panel) border border-(--text-inverse)/60",
        className,
      )}
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            {mobileNavigation ? (
              <div className="lg:hidden">{mobileNavigation}</div>
            ) : null}
            <div>
              {title ? (
                <h1 className="text-[28px] font-semibold tracking-tight text-(--text-heading)">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p
                  className={cn("text-sm text-(--text-muted)", title && "mt-1")}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {actions ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>

        {shouldRenderFiltersRow ? (
          <div className="-mx-6 border-t border-(--border-soft) px-6 pt-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {shouldRenderSearch ? (
                <SearchInput
                  type="search"
                  placeholder={searchPlaceholder}
                  className="w-full lg:max-w-[390px]"
                  onChange={(event) => onSearch?.(event.target.value)}
                />
              ) : null}
              {filterSlot ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                  {filterSlot}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
