"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type StepperStep = {
  id: string;
  label: string;
  description?: ReactNode;
};

export type StepperProps = {
  steps: StepperStep[];
  /** Index of the step being shown. */
  current: number;
  /**
   * How many steps from the start are finished. A step can be opened when it
   * is finished, current, or the one right after the finished ones; later
   * steps stay locked. Defaults to `current` (every step before it).
   */
  completed?: number;
  /** Called when the user opens another step. Leave it out for a display-only stepper. */
  onStepChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
  className?: string;
};

/**
 * Progress through a multi-step flow, such as onboarding. The current step is
 * marked `aria-current="step"`; finished steps can be revisited, and a step
 * cannot be reached before the ones in between are finished.
 */
export function Stepper({
  steps,
  current,
  completed = current,
  onStepChange,
  orientation = "horizontal",
  "aria-label": ariaLabel = "Progress",
  className,
}: StepperProps) {
  const vertical = orientation === "vertical";
  return (
    <nav aria-label={ariaLabel} data-slot="stepper" className={className}>
      <ol
        className={cn(
          "flex gap-2",
          vertical ? "flex-col" : "flex-row flex-wrap items-start",
        )}
      >
        {steps.map((step, index) => {
          const done = index < completed;
          const isCurrent = index === current;
          const reachable = index <= completed;
          const state = isCurrent ? "current" : done ? "complete" : "upcoming";
          const marker = (
            <span
              aria-hidden
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                isCurrent &&
                  "border-(--brand-primary) bg-(--brand-primary) text-(--text-inverse)",
                !isCurrent &&
                  done &&
                  "border-(--brand-primary) bg-(--brand-primary-soft) text-(--brand-primary)",
                !isCurrent &&
                  !done &&
                  "border-(--border-muted) bg-(--surface-card) text-(--text-muted)",
              )}
            >
              {done && !isCurrent ? <Check className="size-4" /> : index + 1}
            </span>
          );
          const text = (
            <span className="min-w-0 text-left">
              <span
                className={cn(
                  "block text-sm font-medium",
                  isCurrent || done
                    ? "text-(--text-strong)"
                    : "text-(--text-muted)",
                )}
              >
                {step.label}
                <span className="sr-only">
                  {state === "complete"
                    ? " (finished)"
                    : state === "upcoming"
                      ? " (not started)"
                      : ""}
                </span>
              </span>
              {step.description ? (
                <span className="block text-xs text-(--text-muted)">
                  {step.description}
                </span>
              ) : null}
            </span>
          );
          return (
            <li
              key={step.id}
              data-state={state}
              className={cn(
                "flex min-w-0 items-center gap-2",
                !vertical && "flex-1",
              )}
            >
              {onStepChange ? (
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  disabled={!reachable}
                  onClick={() => onStepChange(index)}
                  className="flex min-w-0 items-center gap-3 rounded-(--radius-control) p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary) disabled:cursor-not-allowed"
                >
                  {marker}
                  {text}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex min-w-0 items-center gap-3 p-1"
                >
                  {marker}
                  {text}
                </span>
              )}
              {!vertical && index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "hidden h-0.5 min-w-6 flex-1 rounded-full sm:block",
                    done ? "bg-(--brand-primary)" : "bg-(--border-muted)",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
