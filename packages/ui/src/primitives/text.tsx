import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const textVariants = cva("", {
  variants: {
    variant: {
      title: "text-2xl font-semibold tracking-tight text-(--text-heading)",
      heading: "text-lg font-semibold text-(--text-heading)",
      subheading: "text-base font-medium text-(--text-strong)",
      body: "text-sm text-(--text-body)",
      small: "text-xs text-(--text-body)",
      caption: "text-xs text-(--text-muted)",
      label: "text-sm font-medium text-(--text-strong)",
      metric:
        "font-(family-name:--font-family-metric) text-3xl font-semibold tracking-tight text-(--text-heading)",
    },
    tone: {
      inherit: "",
      strong: "text-(--text-strong)",
      muted: "text-(--text-muted)",
      subtle: "text-(--text-subtle)",
      brand: "text-(--brand-primary)",
      success: "text-(--status-success-strong)",
      warning: "text-(--status-warning-strong)",
      danger: "text-(--status-danger-strong)",
      inverse: "text-(--text-inverse)",
    },
    weight: {
      inherit: "",
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
    truncate: {
      true: "truncate",
      false: "",
    },
  },
  defaultVariants: { variant: "body", tone: "inherit", weight: "inherit" },
});

/** The element each variant renders when `as` is not given. */
const DEFAULT_ELEMENT = {
  title: "h1",
  heading: "h2",
  subheading: "h3",
  body: "p",
  small: "p",
  caption: "span",
  label: "span",
  metric: "span",
} as const;

export type TextVariant = keyof typeof DEFAULT_ELEMENT;

export type TextProps = Omit<React.HTMLAttributes<HTMLElement>, "color"> &
  VariantProps<typeof textVariants> & {
    /** The element to render, e.g. `"h2"` for a `title` that is not the page's main heading. */
    as?: React.ElementType;
  };

/**
 * Text in the kit's type scale. Pick the look with `variant` and, when the
 * document outline needs it, the element with `as`; `tone` recolours it.
 */
function Text({
  variant,
  tone,
  weight,
  truncate,
  as,
  className,
  ...props
}: TextProps) {
  const Component = as ?? DEFAULT_ELEMENT[variant ?? "body"];
  return (
    <Component
      data-slot="text"
      className={cn(
        textVariants({ variant, tone, weight, truncate }),
        className,
      )}
      {...props}
    />
  );
}

export { Text, textVariants };
