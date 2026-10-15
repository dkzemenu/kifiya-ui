/**
 * Type-checks every file `init` and `add` scaffold against the built kit
 * packages, so the CLI can never hand an app code that does not compile.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SCREENS, providersTemplate } from "../dist/templates-for-check.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, ".template-check");
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir);

const files = {
  "providers-next.tsx": providersTemplate(true),
  "providers-plain.tsx": providersTemplate(false),
  ...Object.fromEntries(
    Object.entries(SCREENS).map(([name, s]) => [`${name}.tsx`, s.source]),
  ),
};
for (const [name, source] of Object.entries(files))
  writeFileSync(join(dir, name), source);
writeFileSync(
  join(dir, "tsconfig.json"),
  JSON.stringify({
    extends: "../../../tsconfig.base.json",
    compilerOptions: {
      jsx: "react-jsx",
      noEmit: true,
      types: [],
      noUnusedLocals: false,
    },
    include: ["*.tsx", "next-link.d.ts"],
  }),
);
// The Next.js template imports next/link; the CLI does not depend on Next, so
// declare the module the way Next types it for this check.
writeFileSync(
  join(dir, "next-link.d.ts"),
  'declare module "next/link" { import type { ComponentType, AnchorHTMLAttributes } from "react"; const Link: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>; export default Link; }\n',
);

try {
  execFileSync("npx", ["tsc", "-p", dir], { cwd: root, stdio: "pipe" });
  console.log(
    `@kifiya/cli: ${Object.keys(files).length} scaffolded files type-check against the kit`,
  );
} catch (error) {
  console.error(String(error.stdout || error));
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
