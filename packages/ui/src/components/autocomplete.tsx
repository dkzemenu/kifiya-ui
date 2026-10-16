"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { Input } from "../primitives/input";
import { Popover, PopoverAnchor, PopoverContent } from "../primitives/popover";

export type AutocompleteProps<T> = {
  /** The selected option, or `null`. */
  value: T | null;
  /** Called with the chosen option, or `null` when the field is cleared or retyped. */
  onChange: (option: T | null) => void;
  /**
   * Returns the options matching `query`. The app does the fetching (and any
   * paging); the kit only calls this once typing pauses.
   */
  search: (query: string) => Promise<T[]> | T[];
  getOptionLabel: (option: T) => string;
  getOptionKey: (option: T) => string;
  /** Custom row content; defaults to the option's label. */
  renderOption?: (option: T) => ReactNode;
  /** How long typing must pause before `search` runs, in ms. */
  debounceMs?: number;
  /** The shortest query that triggers a search. */
  minQueryLength?: number;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  emptyText?: string;
  loadingText?: string;
  /** Shown when `search` throws; the error itself is never shown. */
  errorText?: string;
  clearLabel?: string;
  className?: string;
};

type Status = "idle" | "loading" | "ready" | "error";

/**
 * A search box that suggests options as the user types and selects one.
 * Arrow keys move through the suggestions, Enter picks one, Escape closes the
 * list, and clearing the field reports `null`.
 */
export function Autocomplete<T>({
  value,
  onChange,
  search,
  getOptionLabel,
  getOptionKey,
  renderOption,
  debounceMs = 300,
  minQueryLength = 1,
  placeholder,
  disabled,
  id,
  name,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  emptyText = "No matches",
  loadingText = "Searching…",
  errorText = "Couldn't load results. Try again.",
  clearLabel = "Clear",
  className,
}: AutocompleteProps<T>) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef(search);
  searchRef.current = search;
  const requestRef = useRef(0);

  // What the input shows, and the query typed by the user (selecting an
  // option changes the first without starting a search).
  const [text, setText] = useState(value ? getOptionLabel(value) : "");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [options, setOptions] = useState<T[]>([]);
  const [active, setActive] = useState(-1);

  // Follow a value the app changes itself (a reset, a prefilled form).
  const valueKey = value ? getOptionKey(value) : null;
  const shownKey = useRef(valueKey);
  useEffect(() => {
    if (valueKey === shownKey.current) return;
    shownKey.current = valueKey;
    if (value) setText(getOptionLabel(value));
    else setText("");
    // Keyed by valueKey: a new object for the same option is not a change.
  }, [valueKey]);

  useEffect(() => {
    const query = term.trim();
    if (query.length < minQueryLength) {
      requestRef.current++;
      setStatus("idle");
      setOptions([]);
      setOpen(false);
      return;
    }
    setStatus("loading");
    setOpen(true);
    const timer = setTimeout(async () => {
      const request = ++requestRef.current;
      try {
        const results = await searchRef.current(query);
        if (request !== requestRef.current) return;
        setOptions(results);
        setActive(results.length ? 0 : -1);
        setStatus("ready");
      } catch {
        if (request !== requestRef.current) return;
        setOptions([]);
        setActive(-1);
        setStatus("error");
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [term, debounceMs, minQueryLength]);

  function select(option: T) {
    shownKey.current = getOptionKey(option);
    setText(getOptionLabel(option));
    setOpen(false);
    onChange(option);
  }

  function clear() {
    shownKey.current = null;
    setText("");
    setTerm("");
    if (value !== null) onChange(null);
    inputRef.current?.focus();
  }

  const optionId = (index: number) => `${listId}-option-${index}`;
  const showList = open && status === "ready" && options.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={anchorRef} className={cn("relative w-full", className)}>
          <Input
            ref={inputRef}
            id={id}
            name={name}
            role="combobox"
            aria-label={ariaLabel}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={
              showList && active >= 0 ? optionId(active) : undefined
            }
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            autoComplete="off"
            placeholder={placeholder}
            disabled={disabled}
            value={text}
            className={text ? "pr-10" : undefined}
            onChange={(event) => {
              const next = event.target.value;
              setText(next);
              setTerm(next);
              if (value !== null) {
                shownKey.current = null;
                onChange(null);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                if (!options.length) return;
                event.preventDefault();
                setOpen(true);
                const step = event.key === "ArrowDown" ? 1 : -1;
                setActive((i) => (i + step + options.length) % options.length);
              } else if (event.key === "Enter") {
                if (showList && active >= 0) {
                  event.preventDefault();
                  select(options[active]!);
                }
              } else if (event.key === "Escape") {
                if (open) {
                  event.preventDefault();
                  setOpen(false);
                }
              } else if (event.key === "Tab") {
                setOpen(false);
              }
            }}
          />
          {text && !disabled ? (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={clear}
              className="absolute top-1/2 right-3 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-(--text-muted) hover:bg-(--surface-subtle) hover:text-(--text-strong)"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="max-h-72 w-(--radix-popover-trigger-width) overflow-y-auto p-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          // The input lives outside the list; typing in it must not close it.
          if (anchorRef.current?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
      >
        <ul id={listId} role="listbox" aria-label={ariaLabel}>
          {showList
            ? options.map((option, index) => (
                <li
                  key={getOptionKey(option)}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === active}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => select(option)}
                  className={cn(
                    "cursor-pointer rounded-(--radius-box) px-3 py-2 text-sm text-(--text-strong)",
                    index === active ? "bg-(--surface-hover)" : "",
                  )}
                >
                  {renderOption ? renderOption(option) : getOptionLabel(option)}
                </li>
              ))
            : null}
        </ul>
        {!showList ? (
          <p
            role="status"
            className="flex items-center gap-2 px-3 py-2 text-sm text-(--text-muted)"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {loadingText}
              </>
            ) : status === "error" ? (
              errorText
            ) : (
              emptyText
            )}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
