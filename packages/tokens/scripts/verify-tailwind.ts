/**
 * Compiles a fixture that imports the built `dist/tailwind.css` through
 * Tailwind v4 itself, and fails if the expected utilities don't come out.
 * Catches what the unit tests can't: invalid @theme/@utility syntax and
 * self-referencing theme variables.
 */
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "@tailwindcss/node";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const candidates = [
  "bg-brand-primary",
  "text-text-strong",
  "bg-status-success-soft",
  "border-border-soft",
  "rounded-card",
  "shadow-card",
  "font-metric",
  "rounded-lg",
  "dark:bg-surface-card",
];

const compiler = await compile(
  `@import "tailwindcss";\n@import "./dist/tailwind.css";`,
  { base: root, onDependency: () => {} },
);
const css = compiler.build(candidates);

const expectations: Array<[string, RegExp]> = [
  ["bg-brand-primary", /\.bg-brand-primary\s*\{[^}]*var\(--brand-primary\)/],
  ["text-text-strong", /\.text-text-strong\s*\{[^}]*var\(--text-strong\)/],
  ["rounded-card", /\.rounded-card\s*\{[^}]*var\(--radius-card\)/],
  ["shadow-card", /\.shadow-card\s*\{[^}]*var\(--shadow-card\)/],
  ["font-metric", /\.font-metric\s*\{[^}]*var\(--font-family-metric\)/],
  ["dark variant", /\.dark/],
  ["k-card", /\.k-card\s*\{/],
  ["theme variables", /--brand-primary:\s*#fb6a3d/],
];

const failures = expectations.filter(([, pattern]) => !pattern.test(css));

// A theme variable defined as itself (e.g. --radius-card: var(--radius-card))
// resolves to nothing at runtime.
const selfRefs = [...css.matchAll(/--([a-z0-9-]+):\s*var\(--\1\)/g)].map(
  (m) => m[1],
);

if (failures.length > 0 || selfRefs.length > 0) {
  for (const [label] of failures) console.error(`missing: ${label}`);
  for (const name of selfRefs) console.error(`self-reference: --${name}`);
  process.exit(1);
}

console.log(
  `@kifiya/tokens: tailwind.css compiles; ${expectations.length} checks passed`,
);
