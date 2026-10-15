import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "../primitives/button";
import { cn } from "../lib/cn";
import { useLinkComponent } from "../provider";

const portalButtonVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border text-sm font-medium shadow-none transition-all",
  {
    variants: {
      variant: {
        primary:
          "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:border-[var(--brand-primary-hover)] hover:bg-[var(--brand-primary-hover)]",
        secondary:
          "border-[var(--brand-secondary)] bg-[var(--brand-secondary)] text-[var(--text-inverse)] hover:border-[var(--brand-secondary-hover)] hover:bg-[var(--brand-secondary-hover)]",
        outline:
          "border-[var(--border-muted)] bg-[var(--surface-card)] text-[var(--text-strong)] hover:bg-[var(--surface-subtle)]",
        ghost:
          "border-transparent bg-transparent text-[var(--text-body)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-strong)]",
        destructive:
          "border-[var(--status-danger)] bg-[var(--status-danger)] text-[var(--text-inverse)] hover:border-[var(--status-danger-hover)] hover:bg-[var(--status-danger-hover)]",
        success:
          "border-[var(--status-success)] bg-[var(--status-success)] text-[var(--text-inverse)] hover:opacity-90",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type BaseProps = Omit<ComponentProps<typeof Button>, "variant" | "size"> &
  VariantProps<typeof portalButtonVariants> & {
    href?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loading?: boolean;
  };

export type PortalButtonProps = BaseProps;

export function PortalButton({
  className,
  variant,
  size,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  href,
  children,
  ...props
}: PortalButtonProps) {
  const Link = useLinkComponent();
  const classes = cn(portalButtonVariants({ variant, size }), className);
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
      {children ? (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          {children}
        </span>
      ) : null}
      {!loading ? rightIcon : null}
    </>
  );

  if (href) {
    return (
      <Button asChild disabled={disabled || loading} className={classes}>
        <Link href={href} aria-disabled={disabled || loading}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {content}
    </Button>
  );
}

export { portalButtonVariants };
