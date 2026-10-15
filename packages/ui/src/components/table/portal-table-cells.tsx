"use client";

import type { CSSProperties, ReactNode } from "react";

import { Avatar, AvatarFallback } from "../../primitives/avatar";
import { Checkbox } from "../../primitives/checkbox";
import { PortalStatusChip } from "../portal-status-chip";
import { cn } from "../../lib/cn";
import { PortalTableRowActions } from "./portal-table-row-actions";
import type { PortalTableColumn } from "./types";

function formatDateValue(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PortalTableCellContent<T>({
  row,
  column,
}: {
  row: T;
  column: PortalTableColumn<T>;
}) {
  const resolveValue = () => {
    if (column.getValue) {
      return column.getValue(row);
    }

    if (!column.accessorKey) {
      return undefined;
    }

    const path = String(column.accessorKey).split(".");
    let value: unknown = row;

    for (const key of path) {
      if (value == null || typeof value !== "object") {
        return undefined;
      }

      value = (value as Record<string, unknown>)[key];
    }

    return value;
  };

  if (column.type === "custom" && column.cell) {
    return column.cell(row);
  }

  if (column.type === "avatar" && column.getAvatar) {
    const avatar = column.getAvatar(row);

    return (
      <div className="flex items-center gap-3">
        <Avatar className="size-7">
          <AvatarFallback
            className={cn(avatar.avatarToneClassName, "text-[10px]")}
          >
            {avatar.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-(--text-heading)">
            {avatar.name}
          </p>
          {avatar.subtitle ? (
            <p className="truncate text-xs text-(--text-muted)">
              {avatar.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (column.type === "chip" && column.getChip) {
    const chip = column.getChip(row);

    return (
      <PortalStatusChip
        label={chip.label}
        tone={chip.tone}
        className={chip.className}
      />
    );
  }

  if (column.type === "multi_status" && column.getChips) {
    const chips = column.getChips(row);

    return (
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <PortalStatusChip
            key={`${chip.label}-${chip.tone ?? "neutral"}`}
            label={chip.label}
            tone={chip.tone}
            className={chip.className}
          />
        ))}
      </div>
    );
  }

  if (column.type === "actions" && column.actions) {
    const actions =
      typeof column.actions === "function"
        ? column.actions(row)
        : column.actions;

    return <PortalTableRowActions row={row} actions={actions} />;
  }

  if (column.type === "date") {
    const value = resolveValue();
    return <span>{formatDateValue(value)}</span>;
  }

  const value = resolveValue();
  const renderedValue =
    value == null || value === "" ? (column.emptyValue ?? "-") : String(value);

  return (
    <span className="block truncate text-sm text-(--text-body)">
      {renderedValue}
    </span>
  );
}

export function PortalSelectionCell({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex justify-center">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export function resolveColumnWidth<T>(
  column: PortalTableColumn<T>,
): CSSProperties | undefined {
  return column.width ? { width: column.width } : undefined;
}

export function renderHeaderContent(content: ReactNode) {
  if (typeof content === "string") {
    return <span>{content}</span>;
  }

  return content;
}
