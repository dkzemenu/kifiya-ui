import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderVariablesCss, themes } from "../src/index";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "variables.css"), renderVariablesCss(themes));
copyFileSync(join(root, "src", "tailwind.css"), join(dist, "tailwind.css"));
writeFileSync(
  join(dist, "tokens.json"),
  `${JSON.stringify({ themes }, null, 2)}\n`,
);

console.log(`@kifiya/tokens: wrote CSS for ${themes.length} theme(s)`);
