"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../lib/cn";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const YEARS_BACK = 100;
const YEARS_FORWARD = 20;

function calendarMonthBounds() {
  const y = new Date().getFullYear();
  return {
    startMonth: new Date(y - YEARS_BACK, 0),
    endMonth: new Date(y + YEARS_FORWARD, 11),
  };
}

export type DatePickerProps = {
  id?: string;
  /** Stored as `yyyy-MM-dd` (same as native date inputs). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show “Clear date” when a value is set (optional end dates). */
  allowClear?: boolean;
};

function parseStoredDateOnly(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const [y, m, d] = trimmed.slice(0, 10).split("-").map(Number);
  if (
    trimmed.length < 10 ||
    y === undefined ||
    m === undefined ||
    d === undefined ||
    Number.isNaN(y) ||
    Number.isNaN(m) ||
    Number.isNaN(d)
  ) {
    return undefined;
  }
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return undefined;
  }
  return date;
}

function formatStoredDateOnly(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  allowClear,
}: DatePickerProps) {
  const selected = parseStoredDateOnly(value);
  const [open, setOpen] = React.useState(false);
  const { startMonth, endMonth } = React.useMemo(
    () => calendarMonthBounds(),
    [],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-start rounded-(--radius-control) border-(--border-muted) bg-(--surface-card) px-4 font-normal shadow-none hover:bg-(--surface-subtle)",
            !selected && "text-(--text-placeholder)",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 opacity-70" />
          <span className="truncate">
            {selected ? format(selected, "PPP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-(--border-muted) p-0 shadow-lg"
        align="start"
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          selected={selected}
          defaultMonth={selected ?? new Date()}
          onSelect={(date) => {
            onChange(date ? formatStoredDateOnly(date) : "");
            setOpen(false);
          }}
          autoFocus
        />
        {allowClear && selected ? (
          <div className="border-t border-(--border-soft) p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-(--text-muted)"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear date
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
