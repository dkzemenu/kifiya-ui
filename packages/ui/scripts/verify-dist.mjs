/**
 * Checks the built package the way an app consumes it:
 *  1. dist/index.js is a client module and imports no framework router;
 *  2. a Vite + Tailwind app importing dist/ and the README's three CSS lines
 *     gets CSS for classes that only exist inside the kit (styles.css @source).
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const bundle = readFileSync(join(root, "dist/index.js"), "utf8");
if (!bundle.startsWith('"use client"')) {
  failures.push('dist/index.js does not start with "use client"');
}
if (
  /from\s*["'](next|next\/[^"']*|next-themes|react-router[^"']*)["']/.test(
    bundle,
  )
) {
  failures.push("dist/index.js imports a framework router");
}

const outDir = mkdtempSync(join(tmpdir(), "kifiya-ui-consumer-"));
try {
  await build({
    root: join(root, "test/fixtures/consumer"),
    logLevel: "error",
    plugins: [tailwindcss()],
    build: { outDir, emptyOutDir: true },
  });
  const assets = join(outDir, "assets");
  const css = readdirSync(assets)
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(join(assets, f), "utf8"))
    .join("\n");

  // Classes used only inside the kit's own source, never in the fixture.
  const expectations = {
    "PortalButton primary background": /var\(--brand-primary\)/,
    "status chip strong text": /var\(--status-success-strong\)/,
    "sheet overlay token": /var\(--overlay\)/,
    "drawer shadow token": /var\(--shadow-drawer\)/,
    "danger hover token": /var\(--status-danger-hover\)/,
    "tw-animate-css keyframes": /@keyframes enter/,
    "token values": /--brand-primary:\s*#fb6a3d/,
  };
  for (const [label, pattern] of Object.entries(expectations)) {
    if (!pattern.test(css)) failures.push(`consumer CSS is missing: ${label}`);
  }
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}
console.log(
  "@kifiya/ui: dist is a client module; a consumer app gets the kit's styles",
);
