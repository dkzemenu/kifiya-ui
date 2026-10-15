"use client";

import type { ReactNode } from "react";

import { PageHeader } from "./page-header";
import { cn } from "../lib/cn";

export interface PortalListPageProps {
  title?: string;
  subtitle?: string;
  mobileNavigation?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function PortalListPage({
  title,
  subtitle,
  mobileNavigation,
  actions,
  filters,
  showSearch = false,
  searchPlaceholder,
  onSearch,
  children,
  className,
}: PortalListPageProps) {
  return (
    <div className={cn("space-y-4 my-2", className)}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        mobileNavigation={mobileNavigation}
        actions={actions}
        filterSlot={filters}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        onSearch={onSearch}
      />
      {children}
    </div>
  );
}
