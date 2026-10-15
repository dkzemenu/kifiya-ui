"use client";

import type { Row } from "@tanstack/react-table";

import {
  PortalSelectionCell,
  PortalTableCellContent,
  resolveColumnWidth,
} from "./portal-table-cells";
import type { PortalTableColumn } from "./types";
import { TableCell, TableRow } from "../../primitives/table";
import { cn } from "../../lib/cn";

export function PortalTableRowRenderer<T>({
  row,
  columns,
  isActive,
  onRowClick,
  isSelected,
  onSelectionChange,
  rowClassName,
}: {
  row: Row<T>;
  columns: PortalTableColumn<T>[];
  isActive: boolean;
  onRowClick?: (row: T) => void;
  isSelected: boolean;
  onSelectionChange?: (checked: boolean) => void;
  rowClassName?: string;
}) {
  return (
    <TableRow
      data-state={isSelected ? "selected" : undefined}
      onClick={() => onRowClick?.(row.original)}
      className={cn(
        "rounded-[5px]",
        onRowClick && "cursor-pointer",
        isActive && "bg-[var(--surface-subtle)]",
        rowClassName,
      )}
    >
      {columns.map((column) => (
        <TableCell
          key={`${row.id}-${column.id}`}
          className={cn(
            "max-w-[220px]",
            column.type === "actions" && "w-12",
            column.className,
          )}
          style={resolveColumnWidth(column)}
          onClick={
            column.type === "actions"
              ? (event) => event.stopPropagation()
              : undefined
          }
        >
          {column.type === "selection" ? (
            <PortalSelectionCell
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange?.(checked)}
              ariaLabel={`Select row ${row.id}`}
            />
          ) : (
            <PortalTableCellContent row={row.original} column={column} />
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
