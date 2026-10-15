// Makes dist/bin.js directly executable as the `kifiya-ui` command.
import { chmodSync, readFileSync, writeFileSync } from "node:fs";

import { resolve } from "node:path";

// Default: this package's dist/bin.js; another package passes its own path.
const path = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : new URL("../dist/bin.js", import.meta.url);
const code = readFileSync(path, "utf8");
if (!code.startsWith("#!")) writeFileSync(path, `#!/usr/bin/env node\n${code}`);
chmodSync(path, 0o755);
