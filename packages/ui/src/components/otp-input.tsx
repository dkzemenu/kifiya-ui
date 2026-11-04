"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "../lib/cn";

export type OtpInputProps = {
  /** The digits typed so far (at most `length`). */
  value: string;
  onChange: (value: string) => void;
  /** Called once every box is filled, with the full code. */
  onComplete?: (code: string) => void;
  length?: number;
  disabled?: boolean;
  /** Names the group, e.g. "Verification code". */
  "aria-label"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  /** Accessible name of each box; gets the position and the length. */
  digitLabel?: (position: number, length: number) => string;
  id?: string;
  className?: string;
};

/**
 * A one-time code in separate boxes. Typing or pasting fills the next boxes,
 * only digits are kept, Backspace steps back, and `onComplete` fires once the
 * code is full. The phone's code suggestion fills it too (`one-time-code`).
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  "aria-label": ariaLabel = "One-time code",
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  digitLabel = (position, total) => `Digit ${position} of ${total}`,
  id,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.replace(/\D/g, "").slice(0, length);

  function commit(next: string, focusIndex: number) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    refs.current[Math.min(focusIndex, length - 1)]?.focus();
    if (clean.length === length) onComplete?.(clean);
  }

  function typeAt(index: number, typed: string) {
    const incoming = typed.replace(/\D/g, "");
    if (!incoming) return;
    const before = digits.slice(0, index);
    const after = digits.slice(index + incoming.length);
    commit(before + incoming + after, index + incoming.length);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        commit(digits.slice(0, index) + digits.slice(index + 1), index);
      } else if (index > 0) {
        commit(digits.slice(0, index - 1) + digits.slice(index), index - 1);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    typeAt(index, event.clipboardData.getData("text"));
  }

  return (
    <div
      role="group"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-slot="otp-input"
      className={cn("flex gap-2", className)}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          aria-label={digitLabel(index + 1, length)}
          aria-invalid={ariaInvalid}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          // Room for a whole pasted or autofilled code in any box.
          maxLength={length}
          disabled={disabled}
          value={digits[index] ?? ""}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) =>
            typeAt(
              index,
              event.target.value.slice(digits[index] ? 1 : 0) ||
                event.target.value,
            )
          }
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
          className="size-12 rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card) text-center text-lg font-semibold text-(--text-strong) outline-none transition-colors focus-visible:border-(--brand-primary) focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] disabled:opacity-50 aria-invalid:border-(--status-danger)"
        />
      ))}
    </div>
  );
}
