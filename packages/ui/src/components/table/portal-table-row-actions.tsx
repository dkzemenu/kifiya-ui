"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "../../primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../primitives/dropdown-menu";
import { cn } from "../../lib/cn";
import type { PortalTableRowAction } from "./types";

export function PortalTableRowActions<T>({
  row,
  actions,
}: {
  row: T;
  actions: PortalTableRowAction<T>[];
}) {
  const visibleActions = actions.filter((action) => !action.hidden);

  if (!visibleActions.length) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-(--text-subtle) hover:bg-(--surface-subtle)"
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <DropdownMenuItem
              key={action.label}
              onClick={() => action.onClick(row)}
              disabled={action.disabled}
              className={cn(
                action.tone === "danger" && "text-(--status-danger)",
              )}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
