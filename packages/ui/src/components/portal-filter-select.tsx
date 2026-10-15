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
   * Extra classes for the portalled dropdown. Needed when the select sits
   * inside another portalled layer — `SelectContent` is `z-50`, so in a
   * popover (`z-[60]`) the dropdown would open behind its own panel.
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
        className={className ?? "min-w-[120px]"}
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
