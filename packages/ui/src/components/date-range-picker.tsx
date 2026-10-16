"use client";

import {
  GregorianCalendar,
  parseDate,
  toCalendar,
  type DateValue,
} from "@internationalized/date";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  I18nProvider,
  Popover,
  RangeCalendar,
  type RangeValue,
} from "react-aria-components";

import { cn } from "../lib/cn";

/** Dates as `yyyy-MM-dd` (Gregorian), like a native date input. */
export type DateRange = { start: string; end: string };

export type DateRangePickerProps = {
  value: DateRange | null;
  /** Called with a complete range whose end is not before its start, or `null` when cleared. */
  onChange: (range: DateRange | null) => void;
  /**
   * The calendar shown to the user. Values stay Gregorian `yyyy-MM-dd`
   * whatever is shown, so the app and its API never convert.
   */
  calendar?: "gregorian" | "ethiopic";
  /** A BCP 47 locale for month names and date order, e.g. `"am-ET"`; defaults to the browser's. */
  locale?: string;
  /** Earliest and latest selectable dates, `yyyy-MM-dd`. */
  minDate?: string;
  maxDate?: string;
  /** Shown when the end is before the start. */
  reversedMessage?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  id?: string;
  disabled?: boolean;
  className?: string;
};

const gregorian = new GregorianCalendar();
const toIso = (date: DateValue) =>
  toCalendar(date, gregorian).toString().slice(0, 10);

function withCalendar(
  locale: string | undefined,
  calendar: "gregorian" | "ethiopic",
) {
  if (calendar === "gregorian") return locale;
  const base = (
    locale ?? (typeof navigator !== "undefined" ? navigator.language : "en-ET")
  ).split("-u-")[0];
  return `${base}-u-ca-ethiopic`;
}

/**
 * A start and end date, typed or picked from a range calendar.
 * An end before the start is refused: the reason is shown and the app is not
 * told. With `calendar="ethiopic"` the user sees and types Ethiopian dates.
 */
export function DateRangePicker({
  value,
  onChange,
  calendar = "gregorian",
  locale,
  minDate,
  maxDate,
  reversedMessage = "The end date can't be before the start date.",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  id,
  disabled,
  className,
}: DateRangePickerProps) {
  // What is on screen, which may be a range the app has not accepted yet.
  const [draft, setDraft] = useState<RangeValue<DateValue> | null>(null);
  const [shownFor, setShownFor] = useState(value);
  if (shownFor !== value) {
    setShownFor(value);
    setDraft(null);
  }
  const current =
    draft ??
    (value
      ? { start: parseDate(value.start), end: parseDate(value.end) }
      : null);
  const reversed = Boolean(current && current.end.compare(current.start) < 0);
  const invalid = reversed || ariaInvalid === true || ariaInvalid === "true";
  const errorId = useId();
  const describedBy =
    [ariaDescribedBy, reversed ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  const segmentClass =
    "rounded-sm px-0.5 tabular-nums outline-none data-[placeholder]:text-(--text-placeholder) data-[focused]:bg-(--brand-primary) data-[focused]:text-(--text-inverse) data-[type=literal]:text-(--text-muted)";

  return (
    <I18nProvider locale={withCalendar(locale, calendar)}>
      <div
        data-slot="date-range-picker"
        className={cn("grid gap-1.5", className)}
      >
        <AriaDateRangePicker
          value={current}
          onChange={(range) => {
            setDraft(range);
            if (!range) {
              onChange(null);
              return;
            }
            if (range.end.compare(range.start) < 0) return;
            onChange({ start: toIso(range.start), end: toIso(range.end) });
          }}
          minValue={minDate ? parseDate(minDate) : undefined}
          maxValue={maxDate ? parseDate(maxDate) : undefined}
          isDisabled={disabled}
          isInvalid={invalid}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={describedBy}
          id={id}
          // The kit shows its own message; React Aria's would duplicate it.
          validationBehavior="aria"
        >
          <Group
            className={cn(
              "flex h-11 w-full items-center gap-1 rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card) pr-2 pl-4 text-sm text-(--text-strong)",
              "data-[focus-within]:border-(--brand-primary) data-[focus-within]:ring-[3px] data-[focus-within]:ring-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] data-[disabled]:opacity-50",
              invalid && "border-(--status-danger)",
            )}
          >
            <DateInput slot="start" className="flex">
              {(segment) => (
                <DateSegment segment={segment} className={segmentClass} />
              )}
            </DateInput>
            <span aria-hidden className="px-1 text-(--text-muted)">
              –
            </span>
            <DateInput slot="end" className="flex flex-1">
              {(segment) => (
                <DateSegment segment={segment} className={segmentClass} />
              )}
            </DateInput>
            <Button className="inline-flex size-8 items-center justify-center rounded-full text-(--text-muted) outline-none hover:bg-(--surface-subtle) data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--brand-primary)">
              <CalendarDays className="size-4" aria-hidden />
            </Button>
          </Group>
          <Popover
            offset={4}
            className="z-[60] rounded-xl border border-(--border-soft) bg-(--surface-card) p-3 text-(--text-strong) shadow-xl outline-none"
          >
            <Dialog className="outline-none">
              <RangeCalendar>
                <header className="mb-2 flex items-center justify-between gap-2">
                  <Button
                    slot="previous"
                    className="inline-flex size-8 items-center justify-center rounded-full outline-none hover:bg-(--surface-subtle) data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--brand-primary)"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                  <Heading className="text-sm font-semibold" />
                  <Button
                    slot="next"
                    className="inline-flex size-8 items-center justify-center rounded-full outline-none hover:bg-(--surface-subtle) data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--brand-primary)"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </header>
                <CalendarGrid className="border-separate border-spacing-y-0.5 text-sm">
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={cn(
                        "flex size-9 cursor-pointer items-center justify-center rounded-md outline-none",
                        "data-[outside-month]:hidden data-[unavailable]:cursor-not-allowed data-[unavailable]:text-(--text-disabled) data-[disabled]:text-(--text-disabled)",
                        "hover:bg-(--surface-hover) data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--brand-primary)",
                        "data-[selected]:rounded-none data-[selected]:bg-(--brand-primary-soft) data-[selected]:text-(--brand-primary)",
                        "data-[selection-start]:rounded-l-md data-[selection-start]:bg-(--brand-primary) data-[selection-start]:text-(--text-inverse)",
                        "data-[selection-end]:rounded-r-md data-[selection-end]:bg-(--brand-primary) data-[selection-end]:text-(--text-inverse)",
                      )}
                    />
                  )}
                </CalendarGrid>
              </RangeCalendar>
            </Dialog>
          </Popover>
        </AriaDateRangePicker>
        {reversed ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-(--status-danger-strong)"
          >
            {reversedMessage}
          </p>
        ) : null}
      </div>
    </I18nProvider>
  );
}
