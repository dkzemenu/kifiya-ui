import type { LucideIcon, LucideProps } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
    tone: {
      inherit: "",
      strong: "text-(--text-strong)",
      muted: "text-(--text-muted)",
      brand: "text-(--brand-primary)",
      success: "text-(--status-success)",
      warning: "text-(--status-warning)",
      danger: "text-(--status-danger)",
      processing: "text-(--status-processing)",
      inverse: "text-(--text-inverse)",
    },
  },
  defaultVariants: { size: "sm", tone: "inherit" },
});

export type IconProps = Omit<LucideProps, "size" | "ref"> &
  VariantProps<typeof iconVariants> & {
    /** Any lucide-react icon, e.g. `icon={Bell}`. */
    icon: LucideIcon;
    /**
     * What the icon means, for screen readers. Leave it out when the icon only
     * decorates text that already says the same thing.
     */
    label?: string;
  };

/** A lucide icon at the kit's sizes and colours. */
function Icon({
  icon: Glyph,
  size,
  tone,
  label,
  className,
  ...props
}: IconProps) {
  return (
    <Glyph
      data-slot="icon"
      className={cn(iconVariants({ size, tone }), className)}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
      {...props}
    />
  );
}

export { Icon };
