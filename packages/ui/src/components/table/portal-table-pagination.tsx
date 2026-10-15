"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { PortalButton } from "../portal-button";
import { PortalFilterSelect } from "../portal-filter-select";
import type { PortalTablePaginationState } from "./types";

export function PortalTablePagination({
  pagination,
  onPaginationChange,
}: {
  pagination: PortalTablePaginationState;
  onPaginationChange: (pagination: PortalTablePaginationState) => void;
}) {
  const pageSizeOptions = pagination.pageSizeOptions ?? [5, 10, 20];
  const totalPages =
    pagination.totalPages ??
    Math.max(1, Math.ceil((pagination.totalItems ?? 0) / pagination.pageSize));
  const canGoBack =
    pagination.first != null ? !pagination.first : pagination.page > 1;
  const canGoForward =
    pagination.last != null ? !pagination.last : pagination.page < totalPages;

  const [pageInput, setPageInput] = useState(String(pagination.page));

  useEffect(() => {
    setPageInput(String(pagination.page));
  }, [pagination.page]);

  const commitPageInput = () => {
    const nextPage = Math.trunc(Number(pageInput));

    if (!Number.isFinite(nextPage) || nextPage < 1) {
      setPageInput(String(pagination.page));
      return;
    }

    const clampedPage = Math.min(nextPage, totalPages);

    if (clampedPage === pagination.page) {
      setPageInput(String(pagination.page));
      return;
    }

    onPaginationChange({ ...pagination, page: clampedPage });
  };

  return (
    <div className="flex flex-col gap-3 border-t border-(--border-soft) px-5 py-4 text-sm text-(--text-muted) sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span>
          Page {pagination.page} of {totalPages}
        </span>
        <label className="flex items-center gap-2">
          <span>Go to</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={totalPages}
            value={pageInput}
            disabled={totalPages <= 1}
            aria-label="Jump to page"
            className="h-9 w-16 rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card) px-2 text-sm text-(--text-body) outline-none disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(event) => setPageInput(event.target.value)}
            onBlur={commitPageInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitPageInput();
              }
            }}
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Rows</span>
          <PortalFilterSelect
            placeholder="Rows"
            options={pageSizeOptions.map((size) => ({
              label: String(size),
              value: String(size),
            }))}
            value={String(pagination.pageSize)}
            onValueChange={(value) =>
              onPaginationChange({
                ...pagination,
                page: 1,
                pageSize: Number(value),
              })
            }
            className="h-9 w-[76px] px-3"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <PortalButton
          variant="outline"
          size="sm"
          disabled={!canGoBack}
          leftIcon={<ChevronLeft className="size-4" />}
          onClick={() =>
            onPaginationChange({ ...pagination, page: pagination.page - 1 })
          }
        >
          Previous
        </PortalButton>
        <PortalButton
          variant="outline"
          size="sm"
          disabled={!canGoForward}
          leftIcon={<ChevronRight className="size-4" />}
          className="flex-row-reverse"
          onClick={() =>
            onPaginationChange({ ...pagination, page: pagination.page + 1 })
          }
        >
          Next
        </PortalButton>
      </div>
    </div>
  );
}
