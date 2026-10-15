"use client";

import { Skeleton } from "../../primitives/skeleton";
import { TableCell, TableRow } from "../../primitives/table";
import { cn } from "../../lib/cn";
import { resolveColumnWidth } from "./portal-table-cells";
import type { PortalTableColumn } from "./types";

const WIDTH_VARIANTS = ["w-3/4", "w-2/3", "w-1/2", "w-5/6"];

function PortalTableSkeletonCellContent<T>({
  column,
  rowIndex,
}: {
  column: PortalTableColumn<T>;
  rowIndex: number;
}) {
  if (column.type === "selection") {
    return <Skeleton className="mx-auto size-4 rounded-lg" />;
  }

  if (column.type === "avatar") {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    );
  }

  if (column.type === "chip") {
    return <Skeleton className="h-5 w-20 rounded-full" />;
  }

  if (column.type === "multi_status") {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    );
  }

  if (column.type === "actions") {
    return <Skeleton className="size-8 rounded-full" />;
  }

  const widthClassName = WIDTH_VARIANTS[rowIndex % WIDTH_VARIANTS.length];

  return <Skeleton className={cn("h-4 rounded", widthClassName)} />;
}

export function PortalTableSkeletonRow<T>({
  columns,
  rowIndex,
}: {
  columns: PortalTableColumn<T>[];
  rowIndex: number;
}) {
  return (
    <TableRow
      data-testid="portal-table-skeleton-row"
      className="rounded-[5px] hover:bg-transparent"
    >
      {columns.map((column) => (
        <TableCell
          key={column.id}
          className={cn(
            "max-w-55",
            column.type === "actions" && "w-12",
            column.className,
          )}
          style={resolveColumnWidth(column)}
        >
          <PortalTableSkeletonCellContent column={column} rowIndex={rowIndex} />
        </TableCell>
      ))}
    </TableRow>
  );
}
