import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "@kifiya/ui",
    "@kifiya/hooks",
    "lucide-react",
  ],
  banner: { js: '"use client";' },
});
