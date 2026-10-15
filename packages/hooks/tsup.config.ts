import { defineConfig } from "tsup";

export default defineConfig({
  // `query` is a separate entry so apps without React Query can import the
  // main entry without pulling it in (it is an optional peer dependency).
  entry: ["src/index.ts", "src/query.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  external: ["react", "@tanstack/react-query", "@kifiya/ui"],
  banner: { js: '"use client";' },
});
