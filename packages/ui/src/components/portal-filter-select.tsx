"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../primitives/select";

export interface PortalFilterOption {
  label: string;
  value: string;
}

export function PortalFilterSelect({
  placeholder,
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  contentClassName,
  disabled,
  id,
  ariaLabel,
  ariaInvalid,
  ariaDescribedBy,
}: {
  placeholder: string;
  options: PortalFilterOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  /**
   * Extra classes for the portalled dropdown. Floating layers share
   * `z-[60]` and stack in the order they open, so a select inside a popover
   * already opens above it.
   */
  contentClassName?: string;
  disabled?: boolean;
  /** Trigger id, so a `<label htmlFor>` can point at it. */
  id?: string;
  /** Accessible name; defaults to the placeholder, as before. */
  ariaLabel?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  return (
    <Select
      value={value}
      defaultValue={defaultValue ?? options[0]?.value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel ?? placeholder}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        className={className ?? "w-auto min-w-[120px] shrink-0"}
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
