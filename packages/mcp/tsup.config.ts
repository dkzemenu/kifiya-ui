import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/bin.ts"],
  format: ["esm"],
  dts: { entry: "src/index.ts" },
  // Keep dist/data.json (written by scripts/build-data.mjs before tsup runs).
  clean: false,
  target: "node20",
  platform: "node",
  onSuccess: "node ../cli/scripts/add-shebang.mjs ./dist/bin.js",
});
