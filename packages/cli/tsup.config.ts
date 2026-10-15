import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    bin: "src/bin.ts",
    // Used only by scripts/verify-templates.mjs.
    "templates-for-check": "src/templates.ts",
  },
  format: ["esm"],
  dts: { entry: "src/index.ts" },
  clean: true,
  target: "node20",
  platform: "node",
  onSuccess: "node scripts/add-shebang.mjs",
});
