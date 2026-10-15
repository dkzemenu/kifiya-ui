"use client";

import {
  DEFAULT_SEARCH_DEBOUNCE_MS,
  useDebouncedValue,
  usePaginationState,
} from "@kifiya/hooks";
import {
  PortalListPage,
  PortalTableCard,
  type PortalTableColumn,
} from "@kifiya/ui";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** What the app should fetch: one page, with the current search term. */
export interface ListQuery {
  /** 1-based. */
  page: number;
  pageSize: number;
  /** Trimmed; empty when there is no search. */
  search: string;
}

export interface FilterableListPageProps<T> {
  title: string;
  subtitle?: string;
  /** Page-level actions, e.g. Export or Create. */
  actions?: ReactNode;
  /** The table card's title. */
  tableTitle: string;
  tableDescription?: string;
  searchPlaceholder?: string;
  /** Filter controls; the app owns their state. */
  filters?: ReactNode;
  /**
   * Changes whenever the filters change (e.g. `JSON.stringify(filters)`), so
   * the page returns to page 1 (AC-03.10).
   */
  filterKey?: string;
  /**
   * Called with the page to fetch: on mount, when the page or page size
   * changes, and once typing in the search box pauses (AC-03.9).
   */
  onQueryChange: (query: ListQuery) => void;
  columns: PortalTableColumn<T>[];
  /** The rows of the current page only. */
  rows: T[];
  totalItems: number;
  getRowId: (row: T) => string;
  isLoading?: boolean;
  /** The app's message when the page failed to load. */
  error?: ReactNode;
  placeholder?: string;
  onRowClick?: (row: T) => void;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  debounceMs?: number;
}

/**
 * A list screen: header with search and filters, and a server-paged table.
 * The page owns paging and the search box; the app owns the filters and
 * fetches whatever `onQueryChange` asks for.
 */
export function FilterableListPage<T>({
  title,
  subtitle,
  actions,
  tableTitle,
  tableDescription,
  searchPlaceholder,
  filters,
  filterKey = "",
  onQueryChange,
  columns,
  rows,
  totalItems,
  getRowId,
  isLoading,
  error,
  placeholder,
  onRowClick,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50],
  debounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
}: FilterableListPageProps<T>) {
  const { page, pageSize, onPaginationChange, setPage } =
    usePaginationState(initialPageSize);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), debounceMs);

  // A new search or filter starts from page 1. Tracked by value so the
  // first render does not count as a change.
  const scope = `${search}\u0000${filterKey}`;
  const previousScope = useRef(scope);
  const scopeChanged = previousScope.current !== scope;
  const effectivePage = scopeChanged ? 1 : page;

  useEffect(() => {
    if (previousScope.current !== scope) {
      previousScope.current = scope;
      setPage(1);
    }
  }, [scope, setPage]);

  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;

  useEffect(() => {
    onQueryChangeRef.current({ page: effectivePage, pageSize, search });
  }, [effectivePage, pageSize, search, filterKey]);

  return (
    <PortalListPage
      title={title}
      subtitle={subtitle}
      actions={actions}
      filters={filters}
      showSearch
      searchPlaceholder={searchPlaceholder}
      onSearch={setSearchInput}
    >
      <PortalTableCard
        title={tableTitle}
        description={tableDescription}
        columns={columns}
        data={rows}
        getRowId={getRowId}
        isLoading={isLoading}
        error={error}
        placeholder={placeholder}
        onRowClick={onRowClick}
        pagination={{
          page: effectivePage,
          pageSize,
          totalItems,
          pageSizeOptions,
        }}
        onPaginationChange={onPaginationChange}
      />
    </PortalListPage>
  );
}
