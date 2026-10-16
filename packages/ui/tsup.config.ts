import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", chart: "src/chart/index.tsx" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  external: ["react", "react-dom", "react/jsx-runtime"],
  // The kit is interactive throughout; marking the bundle as a client module
  // lets Next.js server components import it directly.
  banner: { js: '"use client";' },
});
