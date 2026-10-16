"use client";

import { Check, ChevronDown, X } from "lucide-react";
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Tag,
  TagGroup,
  TagList,
  type Key,
} from "react-aria-components";

import { cn } from "../lib/cn";

export type MultiSelectOption = { value: string; label: string };

export type MultiSelectProps = {
  options: MultiSelectOption[];
  /** The chosen option values, in the order they were chosen. */
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Text in the trigger once something is chosen; gets the count. */
  selectedLabel?: (count: number) => string;
  /** First word of each tag's remove button; screen readers hear it with the tag, e.g. "Remove Oromia". */
  removeLabel?: string;
  /** Names the field when no visible label points at it. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  id?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Pick several options from a list. The chosen ones show as tags below the
 * trigger, each with a remove button. Keyboard: Enter or Space opens the
 * list, arrows move, Space toggles, Escape closes; in the tags, arrows move
 * and Backspace or Delete removes.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  selectedLabel = (count) => `${count} selected`,
  removeLabel = "Remove",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  id,
  disabled,
  className,
}: MultiSelectProps) {
  const byValue = new Map(options.map((option) => [option.value, option]));
  const chosen = value
    .map((v) => byValue.get(v))
    .filter(Boolean) as MultiSelectOption[];
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  return (
    <div data-slot="multi-select" className={cn("grid gap-2", className)}>
      <Select
        selectionMode="multiple"
        value={value}
        onChange={(keys: Key[]) => onChange(keys.map(String))}
        isDisabled={disabled}
        isInvalid={invalid}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        id={id}
        placeholder={placeholder}
      >
        <Button
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 whitespace-nowrap rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card) px-4 text-left text-sm text-(--text-strong) outline-none transition-colors",
            "data-[focus-visible]:border-(--brand-primary) data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            invalid && "border-(--status-danger)",
          )}
        >
          <SelectValue className="truncate data-[placeholder]:text-(--text-subtle)">
            {({ isPlaceholder }) =>
              isPlaceholder ? placeholder : selectedLabel(value.length)
            }
          </SelectValue>
          <ChevronDown
            className="size-4 shrink-0 text-(--text-muted)"
            aria-hidden
          />
        </Button>
        <Popover
          offset={4}
          className="z-[60] max-h-72 w-(--trigger-width) overflow-y-auto rounded-xl border border-(--border-soft) bg-(--surface-card) p-1 text-(--text-strong) shadow-xl outline-none data-[entering]:animate-in data-[entering]:fade-in-0 data-[exiting]:animate-out data-[exiting]:fade-out-0"
        >
          <ListBox items={options} className="outline-none">
            {(option) => (
              <ListBoxItem
                id={option.value}
                textValue={option.label}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-(--radius-box) px-3 py-2 text-sm outline-none data-[focused]:bg-(--surface-hover) data-[selected]:font-medium"
              >
                {({ isSelected }) => (
                  <>
                    {option.label}
                    <Check
                      className={cn(
                        "size-4 text-(--brand-primary)",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                  </>
                )}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </Select>
      {chosen.length ? (
        <TagGroup
          aria-label={ariaLabel ? `${ariaLabel}, chosen` : "Chosen"}
          onRemove={(keys) => onChange(value.filter((v) => !keys.has(v)))}
          className="outline-none"
        >
          <TagList items={chosen} className="flex flex-wrap gap-2">
            {(option) => (
              <Tag
                id={option.value}
                textValue={option.label}
                isDisabled={disabled}
                className="inline-flex items-center gap-1 rounded-(--radius-pill) border border-(--border-soft) bg-(--surface-muted) py-1 pr-1 pl-3 text-xs font-medium text-(--text-strong) outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--brand-primary)"
              >
                {option.label}
                <Button
                  slot="remove"
                  aria-label={removeLabel}
                  className="inline-flex size-5 items-center justify-center rounded-full text-(--text-muted) outline-none hover:bg-(--surface-hover) hover:text-(--text-strong)"
                >
                  <X className="size-3" aria-hidden />
                </Button>
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ) : null}
    </div>
  );
}
