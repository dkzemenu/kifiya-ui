import type { ThemeDefinition } from "../types.js";

/**
 * The Kifiya theme. Values are taken unchanged from the agent-frontend portal
 * (`src/app/globals.css`), minus its page-specific dashboard and ledger tokens.
 */
export const kifiyaTheme: ThemeDefinition = {
  name: "kifiya",
  label: "Kifiya",
  base: {
    radius: "1.4rem",
    "radius-card": "8px",
    "radius-panel": "18px",
    "radius-tile": "14px",
    "radius-control": "12px",
    "radius-pill": "999px",
    "radius-input": "4px",
    "radius-rectangle": "5px",
    "radius-box": "6px",

    // Apps load the actual font files (e.g. next/font) and set these variables;
    // the fallbacks keep text readable when they don't.
    "font-family-sans":
      "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)",
    "font-family-mono": "var(--font-geist-mono, ui-monospace, monospace)",
    "font-family-metric":
      "var(--font-inter-tight, ui-sans-serif, system-ui, sans-serif)",
  },
  light: {
    // shadcn/ui semantic colours
    background: "oklch(0.986 0.004 95.2)",
    foreground: "oklch(0.2 0.015 248.5)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.2 0.015 248.5)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.2 0.015 248.5)",
    primary: "oklch(0.26 0.07 249.14)",
    "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.95 0.01 247.86)",
    "secondary-foreground": "oklch(0.26 0.07 249.14)",
    muted: "oklch(0.96 0.006 247.86)",
    "muted-foreground": "oklch(0.47 0.02 248.32)",
    accent: "oklch(0.91 0.03 217.96)",
    "accent-foreground": "oklch(0.26 0.07 249.14)",
    destructive: "oklch(0.62 0.22 25.33)",
    border: "oklch(0.9 0.01 247.88)",
    input: "oklch(0.92 0.01 247.9)",
    ring: "oklch(0.71 0.08 240.6)",

    // Brand
    "brand-primary": "#fb6a3d",
    "brand-primary-hover": "#f15a2c",
    "brand-primary-soft": "#fff3ee",
    "brand-primary-strong": "#ff2d20",
    "brand-secondary-strong": "#f26738",
    "brand-secondary": "#1f2937",
    "brand-secondary-hover": "#111827",
    "brand-logo-accent": "#f59e0b",

    // Surfaces
    "surface-canvas": "#f8f9fa",
    "surface-app": "#dfe5ea",
    "surface-sidebar": "#eef1f5",
    "surface-card": "#ffffff",
    "surface-muted": "#f3f5f8",
    "surface-subtle": "#f4f6f8",
    "surface-hover": "#fafbfc",
    "surface-neutral": "#f5f5f6",

    // Borders
    "border-soft": "#eceff3",
    "border-muted": "#e7ebf1",
    "border-strong": "#d5dae1",

    // Text
    "text-strong": "#111827",
    "text-heading": "#2f3135",
    "text-body": "#374151",
    "text-subtle": "#5f6674",
    "text-muted": "#7b8494",
    "text-faint": "#8c93a3",
    "text-placeholder": "#9ca3af",
    "text-disabled": "#b0b7c3",
    "text-inverse": "#ffffff",

    // Status
    "status-success": "#22c55e",
    "status-success-strong": "#2ca73b",
    "status-success-soft": "#ecfdf3",
    "status-warning": "#f4b400",
    "status-warning-soft": "#fce7c7",
    "status-warning-strong": "#9a6700",
    "status-danger": "#ef4444",
    "status-danger-soft": "#fee2e2",
    "status-danger-strong": "#b42318",
    "status-danger-hover": "#dc2626",
    "status-neutral": "#6b7280",
    "status-neutral-soft": "#f3f4f6",
    "status-processing": "#9b6bff",
    "status-processing-soft": "#f1ebff",

    // Charts and avatars
    "chart-1": "#7d99b3",
    "chart-2": "#cf9270",
    "chart-3": "#83b1a1",
    "chart-4": "#a99cc6",
    "avatar-initials-bg": "#4f86f7",
    "avatar-amber": "#f7b267",

    // The Kifiya logo: the wordmark and the dot over the "i".
    "logo-ink": "#02404f",
    "logo-accent": "#eb7d23",

    // Elevation
    "shadow-card": "0 18px 40px rgba(17, 24, 39, 0.04)",
    "shadow-card-strong": "0 18px 45px rgba(17, 24, 39, 0.06)",
    "shadow-subtle": "0 10px 20px rgba(17, 24, 39, 0.06)",
    "shadow-elevated": "0 24px 60px rgba(17, 24, 39, 0.08)",
    "shadow-xs": "0 1px 2px rgba(15, 23, 42, 0.05)",
    "shadow-overlay": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "shadow-drawer": "-16px 0 40px -12px rgba(15, 23, 42, 0.12)",

    // Stat card icon tile
    "stat-icon-bg": "#2f3135",
    "stat-icon-shadow": "0 1px 2px rgba(15, 23, 42, 0.12)",

    // Backdrop behind sheets and drawers
    overlay: "rgb(0 0 0 / 0.45)",

    // Tables
    "table-header-bg": "var(--surface-subtle)",
    "table-row-hover": "var(--surface-hover)",

    // Sidebar
    "sidebar-bg": "var(--surface-sidebar)",
    "sidebar-border": "#e2e7ef",
    "sidebar-text": "var(--text-subtle)",
    "sidebar-heading": "var(--text-heading)",
    "sidebar-muted": "var(--text-disabled)",
    "sidebar-hover":
      "color-mix(in srgb, var(--surface-card) 72%, var(--surface-sidebar))",
    "sidebar-active": "var(--brand-primary)",
    "sidebar-active-text": "var(--text-inverse)",
    "sidebar-active-shadow":
      "0 1px 0 rgb(255 255 255 / 0.14) inset, 0 2px 10px rgb(251 106 61 / 0.22)",
    "sidebar-count-bg": "#9ca3af",
    "sidebar-count-text": "var(--text-inverse)",
    "sidebar-profile-bg": "var(--surface-card)",
    "sidebar-profile-border": "#e1e6ee",
    "sidebar-shadow": "0 1px 0 rgb(15 23 42 / 0.05)",
    "sidebar-profile-shadow":
      "0 1px 2px rgb(15 23 42 / 0.05), 0 8px 20px rgb(15 23 42 / 0.04)",

    // Page shell
    "page-shell-radial": "rgba(251, 106, 61, 0.12)",
    "page-shell-gradient":
      "linear-gradient(160deg, #f7f5ef 0%, #eef5ff 50%, #f8fbff 100%)",
    "page-header-backdrop":
      "color-mix(in srgb, var(--surface-card) 88%, transparent)",
  },
  dark: {
    background: "oklch(0.17 0.02 255.2)",
    foreground: "oklch(0.98 0.002 247.85)",
    card: "oklch(0.23 0.02 255.11)",
    "card-foreground": "oklch(0.98 0.002 247.85)",
    popover: "oklch(0.23 0.02 255.11)",
    "popover-foreground": "oklch(0.98 0.002 247.85)",
    primary: "oklch(0.94 0.01 248.17)",
    "primary-foreground": "oklch(0.24 0.04 260.03)",
    secondary: "oklch(0.28 0.02 252.57)",
    "secondary-foreground": "oklch(0.96 0.01 247.9)",
    muted: "oklch(0.27 0.02 252.57)",
    "muted-foreground": "oklch(0.72 0.02 248.12)",
    accent: "oklch(0.33 0.03 240.96)",
    "accent-foreground": "oklch(0.96 0.01 247.9)",
    destructive: "oklch(0.69 0.19 23.57)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.55 0.08 240.54)",

    "brand-primary": "#fb6a3d",
    "brand-primary-hover": "#ff855f",
    "brand-primary-soft": "color-mix(in srgb, #fb6a3d 22%, transparent)",
    "brand-primary-strong": "#ff8a65",
    "brand-secondary-strong": "#f26738",
    "brand-secondary": "#e8eaed",
    "brand-secondary-hover": "#f3f4f6",
    "brand-logo-accent": "#fbbf24",

    "surface-canvas": "#0c0f14",
    "surface-app": "#12161e",
    "surface-sidebar": "#141922",
    "surface-card": "#1a1f2a",
    "surface-muted": "#222833",
    "surface-subtle": "#1e242f",
    "surface-hover": "#252b38",
    "surface-neutral": "#202631",

    "border-soft": "#2a3142",
    "border-muted": "#343c4f",
    "border-strong": "#3d4759",

    "text-strong": "#f3f4f6",
    "text-heading": "#e8eaed",
    "text-body": "#cbd5e1",
    "text-subtle": "#94a3b8",
    "text-muted": "#8792a3",
    "text-faint": "#7b8494",
    "text-placeholder": "#64748b",
    "text-disabled": "#5c6570",
    "text-inverse": "#ffffff",

    "status-success": "#4ade80",
    "status-success-strong": "#22c55e",
    "status-success-soft": "color-mix(in srgb, #22c55e 18%, transparent)",
    "status-warning": "#fbbf24",
    "status-warning-soft": "color-mix(in srgb, #fbbf24 20%, transparent)",
    // Same as light: agent-frontend used one literal in both modes (D-004).
    "status-warning-strong": "#9a6700",
    "status-danger": "#f87171",
    "status-danger-soft": "color-mix(in srgb, #f87171 18%, transparent)",
    "status-danger-strong": "#b42318",
    "status-danger-hover": "#dc2626",
    "status-neutral": "#94a3b8",
    "status-neutral-soft": "#2d3548",
    "status-processing": "#c4b5fd",
    "status-processing-soft": "color-mix(in srgb, #9b6bff 22%, transparent)",

    "chart-1": "#8aa6c0",
    "chart-2": "#d8a07e",
    "chart-3": "#8fbdad",
    "chart-4": "#b4a8d2",
    // agent-frontend sets no dark value for this one; the light value is kept.
    "avatar-initials-bg": "#4f86f7",
    "avatar-amber": "#f7b267",

    // DECISION: D-019 — the dark teal wordmark is unreadable on dark surfaces.
    "logo-ink": "var(--text-strong)",
    "logo-accent": "#eb7d23",

    "shadow-card": "0 18px 40px rgba(0, 0, 0, 0.35)",
    "shadow-card-strong": "0 18px 45px rgba(0, 0, 0, 0.45)",
    "shadow-subtle": "0 10px 20px rgba(0, 0, 0, 0.25)",
    "shadow-elevated": "0 24px 60px rgba(0, 0, 0, 0.4)",
    // Same as light (D-004).
    "shadow-xs": "0 1px 2px rgba(15, 23, 42, 0.05)",
    "shadow-overlay": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "shadow-drawer": "-16px 0 40px -12px rgba(15, 23, 42, 0.12)",

    "stat-icon-bg": "#2f3135",
    "stat-icon-shadow": "0 1px 2px rgba(15, 23, 42, 0.12)",

    overlay: "rgb(0 0 0 / 0.45)",

    "table-header-bg": "var(--surface-subtle)",
    "table-row-hover": "var(--surface-hover)",

    "sidebar-bg": "var(--surface-sidebar)",
    "sidebar-border": "#2a3142",
    "sidebar-text": "var(--text-subtle)",
    "sidebar-heading": "var(--text-heading)",
    "sidebar-muted": "var(--text-disabled)",
    "sidebar-hover": "var(--surface-subtle)",
    "sidebar-active": "var(--brand-primary)",
    "sidebar-active-text": "var(--text-inverse)",
    "sidebar-active-shadow":
      "0 1px 0 rgb(255 255 255 / 0.08) inset, 0 2px 14px rgb(251 106 61 / 0.28)",
    "sidebar-count-bg": "#4b5563",
    "sidebar-count-text": "var(--text-inverse)",
    "sidebar-profile-bg": "var(--surface-card)",
    "sidebar-profile-border": "#2f3849",
    "sidebar-shadow": "0 1px 0 rgb(0 0 0 / 0.35)",
    "sidebar-profile-shadow":
      "0 1px 0 rgb(0 0 0 / 0.25), 0 10px 24px rgb(0 0 0 / 0.35)",

    "page-shell-radial": "rgba(251, 106, 61, 0.16)",
    "page-shell-gradient":
      "linear-gradient(160deg, #0f141c 0%, #121a28 50%, #141d2e 100%)",
    "page-header-backdrop":
      "color-mix(in srgb, var(--surface-card) 88%, transparent)",
  },
};
