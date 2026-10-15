"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../primitives/table";
import { cn } from "../../lib/cn";
import { computePortalTableMinWidth } from "./column-widths";
import { PortalTablePagination } from "./portal-table-pagination";
import { PortalTablePlaceholder } from "./portal-table-placeholder";
import { PortalTableRowRenderer } from "./portal-table-row";
import { PortalTableSkeletonRow } from "./portal-table-skeleton-row";
import { PortalSelectionCell, renderHeaderContent } from "./portal-table-cells";
import type {
  PortalTableColumn,
  PortalTablePaginationState,
  PortalTableProps,
  PortalTableSortState,
} from "./types";

function buildColumnDefs<T>(
  columns: PortalTableColumn<T>[],
  currentSort?: PortalTableSortState,
  onSortChange?: (sort: PortalTableSortState) => void,
): ColumnDef<T>[] {
  return columns.map((column) => ({
    id: column.id,
    accessorFn:
      column.type === "selection"
        ? undefined
        : (row) => {
            if (column.getValue) {
              return column.getValue(row);
            }

            if (!column.accessorKey) {
              return undefined;
            }

            return String(column.accessorKey)
              .split(".")
              .reduce<unknown>((value, key) => {
                if (value == null || typeof value !== "object") {
                  return undefined;
                }

                return (value as Record<string, unknown>)[key];
              }, row);
          },
    enableSorting: column.sortable,
    header: () => {
      const isSorted = currentSort?.columnId === column.id;
      const sortIndicator = isSorted
        ? currentSort?.direction === "asc"
          ? "↑"
          : "↓"
        : "↕";

      if (!column.sortable) {
        return renderHeaderContent(column.header);
      }

      return (
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 text-left"
          onClick={() => {
            if (!onSortChange) {
              return;
            }

            const nextDirection =
              currentSort?.columnId === column.id &&
              currentSort.direction === "asc"
                ? "desc"
                : "asc";

            onSortChange({ columnId: column.id, direction: nextDirection });
          }}
        >
          {renderHeaderContent(column.header)}
          {column.sortable ? (
            <span
              className={cn(
                "text-[10px]",
                isSorted ? "text-(--text-heading)" : "text-(--text-faint)",
              )}
            >
              {sortIndicator}
            </span>
          ) : null}
        </button>
      );
    },
    cell: () => null,
  }));
}

export function PortalTable<T>({
  data,
  columns,
  isLoading = false,
  error,
  placeholder = "No records found",
  selectedRowIds,
  onSelectionChange,
  onRowClick,
  activeRowId,
  sort,
  onSortChange,
  pagination,
  onPaginationChange,
  tableClassName,
  rowClassName,
  getRowId,
}: PortalTableProps<T>) {
  const selectionColumnIds = columns
    .filter((column) => column.type === "selection")
    .map((column) => column.id);
  const isSortControlled = Boolean(onSortChange && sort);
  const isPaginationControlled = Boolean(onPaginationChange && pagination);
  const currentSort = isSortControlled ? sort : undefined;
  const [internalSort, setInternalSort] = useState<
    PortalTableSortState | undefined
  >(sort);
  const [internalPagination, setInternalPagination] =
    useState<PortalTablePaginationState>(
      pagination ?? {
        page: 1,
        pageSize: 5,
        totalItems: data.length,
        pageSizeOptions: [5, 10, 20],
      },
    );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const minTableWidth = useMemo(
    () => computePortalTableMinWidth(columns),
    [columns],
  );

  const effectiveSort = currentSort ?? internalSort;
  const effectivePagination = isPaginationControlled
    ? pagination
    : internalPagination;
  const resolvedPagination = effectivePagination ?? internalPagination;

  useEffect(() => {
    if (!selectedRowIds || !getRowId) {
      return;
    }

    const nextSelection = data.reduce<RowSelectionState>((acc, row, index) => {
      const rowId = getRowId(row, index);
      if (selectedRowIds.includes(rowId)) {
        acc[rowId] = true;
      }
      return acc;
    }, {});

    setRowSelection(nextSelection);
  }, [data, getRowId, selectedRowIds]);

  const columnDefs = useMemo(
    () =>
      buildColumnDefs(columns, effectiveSort, (nextSort) => {
        if (onSortChange) {
          onSortChange(nextSort);
          return;
        }

        setInternalSort(nextSort);
      }),
    [columns, effectiveSort, onSortChange],
  );

  const sortingState = useMemo<SortingState>(
    () =>
      effectiveSort
        ? [
            {
              id: effectiveSort.columnId,
              desc: effectiveSort.direction === "desc",
            },
          ]
        : [],
    [effectiveSort],
  );

  const paginationState = useMemo<PaginationState>(
    () => ({
      pageIndex: resolvedPagination.page - 1,
      pageSize: resolvedPagination.pageSize,
    }),
    [resolvedPagination],
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting: sortingState,
      rowSelection,
      pagination: paginationState,
    },
    onRowSelectionChange: setRowSelection,
    getRowId,
    manualPagination: isPaginationControlled,
    pageCount:
      resolvedPagination.totalPages ??
      Math.max(
        1,
        Math.ceil(
          (resolvedPagination.totalItems ?? data.length) /
            resolvedPagination.pageSize,
        ),
      ),
  });

  useEffect(() => {
    if (!onSelectionChange) {
      return;
    }

    const selectedRows = table
      .getCoreRowModel()
      .rows.filter((row) => rowSelection[row.id])
      .map((row) => row.original);

    onSelectionChange(selectedRows);
  }, [onSelectionChange, rowSelection, table]);

  useEffect(() => {
    if (isPaginationControlled || !effectiveSort) {
      return;
    }

    setInternalPagination((current) => ({
      ...current,
      totalItems: table.getSortedRowModel().rows.length,
      totalPages: Math.max(
        1,
        Math.ceil(table.getSortedRowModel().rows.length / current.pageSize),
      ),
    }));
  }, [effectiveSort, isPaginationControlled, table]);

  useEffect(() => {
    if (!isPaginationControlled || !pagination) {
      return;
    }

    setInternalPagination(pagination);
  }, [isPaginationControlled, pagination]);

  const displayedRows = isPaginationControlled
    ? table.getCoreRowModel().rows
    : table.getPaginationRowModel().rows;

  const hasRows = displayedRows.length > 0;
  const skeletonRowCount = Math.min(
    Math.max(resolvedPagination.pageSize, 3),
    10,
  );

  return (
    <div className="min-w-0">
      <Table
        className={cn("table-fixed", tableClassName)}
        style={{ minWidth: minTableWidth }}
      >
        <TableHeader className="bg-(--table-header-bg)">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="rounded-[5px] hover:bg-transparent"
            >
              {headerGroup.headers.map((header, index) => {
                const column = columns[index];

                if (!column) {
                  return null;
                }

                return (
                  <TableHead
                    key={header.id}
                    className={cn(column.headerClassName)}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.type === "selection" ? (
                      <PortalSelectionCell
                        checked={
                          displayedRows.length > 0 &&
                          displayedRows.every((row) => rowSelection[row.id])
                        }
                        onCheckedChange={(checked) => {
                          const nextSelection =
                            displayedRows.reduce<RowSelectionState>(
                              (acc, row) => {
                                if (checked) {
                                  acc[row.id] = true;
                                }
                                return acc;
                              },
                              {},
                            );

                          setRowSelection((prev) => {
                            const remaining = { ...prev };
                            for (const row of displayedRows) {
                              delete remaining[row.id];
                            }
                            return { ...remaining, ...nextSelection };
                          });
                        }}
                        ariaLabel="Select all rows"
                      />
                    ) : header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRowCount }).map((_, index) => (
              <PortalTableSkeletonRow
                key={`skeleton-${index}`}
                columns={columns}
                rowIndex={index}
              />
            ))
          ) : error ? (
            <TableRow className="rounded-[5px] hover:bg-transparent">
              <TableCell colSpan={columns.length} className="px-0 py-0">
                <PortalTablePlaceholder placeholder={error} tone="error" />
              </TableCell>
            </TableRow>
          ) : hasRows ? (
            displayedRows.map((row) => (
              <PortalTableRowRenderer
                key={row.id}
                row={row}
                columns={columns}
                isActive={activeRowId === row.id}
                isSelected={Boolean(rowSelection[row.id])}
                onSelectionChange={
                  selectionColumnIds.length
                    ? (checked) =>
                        setRowSelection((prev) => ({
                          ...prev,
                          [row.id]: checked,
                        }))
                    : undefined
                }
                onRowClick={onRowClick}
                rowClassName={
                  typeof rowClassName === "function"
                    ? rowClassName(row)
                    : rowClassName
                }
              />
            ))
          ) : (
            <TableRow className="rounded-[5px] hover:bg-transparent">
              <TableCell colSpan={columns.length} className="px-0 py-0">
                <PortalTablePlaceholder placeholder={placeholder} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {effectivePagination ? (
        <PortalTablePagination
          pagination={{
            ...effectivePagination,
            totalItems:
              effectivePagination.totalItems ??
              (isPaginationControlled
                ? effectivePagination.totalItems
                : table.getSortedRowModel().rows.length),
            totalPages:
              effectivePagination.totalPages ??
              (isPaginationControlled
                ? effectivePagination.totalPages
                : Math.max(
                    1,
                    Math.ceil(
                      table.getSortedRowModel().rows.length /
                        effectivePagination.pageSize,
                    ),
                  )),
          }}
          onPaginationChange={(nextPagination) => {
            if (isPaginationControlled && onPaginationChange) {
              onPaginationChange(nextPagination);
              return;
            }

            setInternalPagination(nextPagination);
            table.setPageIndex(nextPagination.page - 1);
            table.setPageSize(nextPagination.pageSize);
          }}
        />
      ) : null}
    </div>
  );
}
