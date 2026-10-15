"use client";

import { useCallback, useState } from "react";

/**
 * 1-based page + page-size state matching `PortalTable`'s pagination
 * contract, with a `resetPage` helper for filter/search changes.
 */
export function usePaginationState(initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const onPaginationChange = useCallback(
    (next: { page: number; pageSize: number }) => {
      setPage(next.page);
      setPageSize(next.pageSize);
    },
    [],
  );

  const resetPage = useCallback(() => setPage(1), []);

  return {
    page,
    pageSize,
    onPaginationChange,
    resetPage,
    setPage,
    setPageSize,
  };
}
