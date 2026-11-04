"use client";

import { Minus, Plus } from "lucide-react";
import {
  Button,
  Group,
  I18nProvider,
  Input,
  NumberField as AriaNumberField,
} from "react-aria-components";

import { cn } from "../lib/cn";

type SharedProps = {
  /** A BCP 47 locale for separators and symbols, e.g. `"en-ET"`; defaults to the browser's. */
  locale?: string;
  placeholder?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
};

export type NumberFieldProps = SharedProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  minValue?: number;
  maxValue?: number;
  /** The amount each step button and arrow key moves by. */
  step?: number;
  /** `Intl.NumberFormat` options, e.g. `{ style: "percent" }` or `{ maximumFractionDigits: 0 }`. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Shows − and + buttons. */
  showStepper?: boolean;
  decrementLabel?: string;
  incrementLabel?: string;
};

const inputClass =
  "min-w-0 flex-1 bg-transparent px-4 text-sm text-(--text-strong) tabular-nums outline-none placeholder:text-(--text-placeholder)";

function groupClass(invalid: boolean) {
  return cn(
    "flex h-11 w-full items-center overflow-hidden rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card)",
    "data-[focus-within]:border-(--brand-primary) data-[focus-within]:ring-[3px] data-[focus-within]:ring-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] data-[disabled]:opacity-50",
    invalid && "border-(--status-danger)",
  );
}

const stepButtonClass =
  "inline-flex h-full w-10 items-center justify-center text-(--text-muted) outline-none hover:bg-(--surface-subtle) data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-(--brand-primary)";

/**
 * A number typed in the user's locale (thousands separators, decimal mark)
 * and handed to the app as a plain number. Arrow keys step it.
 */
export function NumberField({
  value,
  onChange,
  minValue,
  maxValue,
  step,
  formatOptions,
  showStepper = false,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  locale,
  placeholder,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  id,
  name,
  disabled,
  className,
}: NumberFieldProps) {
  const invalid = ariaInvalid === true || ariaInvalid === "true";
  const field = (
    <AriaNumberField
      data-slot="number-field"
      value={value ?? Number.NaN}
      onChange={(next) => onChange(Number.isNaN(next) ? null : next)}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      formatOptions={formatOptions}
      isDisabled={disabled}
      isInvalid={invalid}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      id={id}
      name={name}
      className={className}
    >
      <Group className={groupClass(invalid)}>
        {showStepper ? (
          <Button
            slot="decrement"
            aria-label={decrementLabel}
            className={stepButtonClass}
          >
            <Minus className="size-4" aria-hidden />
          </Button>
        ) : null}
        <Input placeholder={placeholder} className={inputClass} />
        {showStepper ? (
          <Button
            slot="increment"
            aria-label={incrementLabel}
            className={stepButtonClass}
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        ) : null}
      </Group>
    </AriaNumberField>
  );
  return locale ? <I18nProvider locale={locale}>{field}</I18nProvider> : field;
}

/** How many minor units a currency has (ETB and USD 2, JPY 0, KWD 3). */
export function currencyFractionDigits(currency: string): number {
  return (
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

export type CurrencyFieldProps = SharedProps & {
  /** The amount in whole minor units (santim for ETB), or `null` when empty. */
  amountMinor: number | null;
  /** Called with whole minor units, never a fraction. */
  onChange: (amountMinor: number | null) => void;
  /** ISO 4217 code, e.g. `"ETB"`. */
  currency: string;
  /** Limits, in minor units. */
  minMinor?: number;
  maxMinor?: number;
  /** How the currency is written: `"code"` (ETB 1,250.00) or `"symbol"` where the locale has one. */
  currencyDisplay?: "code" | "symbol" | "narrowSymbol";
};

/**
 * An amount of money. The user types it in major units, formatted for the
 * locale; the app gets and gives whole minor units plus the currency code,
 * so no fraction of a santim ever reaches it.
 */
export function CurrencyField({
  amountMinor,
  onChange,
  currency,
  minMinor,
  maxMinor,
  currencyDisplay = "code",
  ...shared
}: CurrencyFieldProps) {
  const digits = currencyFractionDigits(currency);
  const scale = 10 ** digits;
  const toMajor = (minor: number | undefined | null) =>
    minor == null ? undefined : minor / scale;
  return (
    <NumberField
      {...shared}
      value={amountMinor == null ? null : amountMinor / scale}
      onChange={(major) =>
        onChange(major == null ? null : Math.round(major * scale))
      }
      minValue={toMajor(minMinor)}
      maxValue={toMajor(maxMinor)}
      formatOptions={{
        style: "currency",
        currency,
        currencyDisplay,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }}
    />
  );
}
