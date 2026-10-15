import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { cssVar, renderVariablesCss, themes, tokenNames } from "../src/index";

const tailwindCss = readFileSync(
  join(import.meta.dirname, "..", "src", "tailwind.css"),
  "utf8",
);

describe("themes", () => {
  it.each(themes.map((t) => [t.name, t] as const))(
    "%s defines the same keys in light and dark",
    (_name, theme) => {
      expect(Object.keys(theme.dark).sort()).toEqual(
        Object.keys(theme.light).sort(),
      );
    },
  );

  it("never repeats a key between base and the colour modes", () => {
    for (const theme of themes) {
      const overlap = Object.keys(theme.base).filter((k) => k in theme.light);
      expect(overlap).toEqual([]);
    }
  });

  it("gives every theme the default theme's full token set", () => {
    const [defaultTheme, ...others] = themes;
    for (const theme of others) {
      expect(Object.keys(theme.light).sort()).toEqual(
        Object.keys(defaultTheme!.light).sort(),
      );
      expect(Object.keys(theme.base).sort()).toEqual(
        Object.keys(defaultTheme!.base).sort(),
      );
    }
  });

  it("only references tokens that exist", () => {
    const known = new Set(tokenNames);
    for (const theme of themes) {
      for (const value of [
        ...Object.values(theme.light),
        ...Object.values(theme.dark),
      ]) {
        for (const [, name] of value.matchAll(/var\(--([a-z0-9-]+)/g)) {
          // App-provided font variables are intentionally external.
          if (name!.startsWith("font-")) continue;
          expect(known, `unknown token --${name}`).toContain(name);
        }
      }
    }
  });
});

describe("renderVariablesCss", () => {
  const css = renderVariablesCss(themes);

  it("applies the default theme at :root and dark mode via .dark", () => {
    expect(css).toMatch(/:root,\n\[data-theme="kifiya"\] \{/);
    expect(css).toMatch(/\.dark,\n\[data-theme="kifiya"\]\.dark/);
  });

  it("declares every token", () => {
    for (const name of tokenNames) {
      expect(css).toContain(`--${name}:`);
    }
  });
});

describe("tailwind.css", () => {
  it("maps only to tokens that exist", () => {
    const known = new Set(tokenNames);
    for (const [, name] of tailwindCss.matchAll(/var\(--([a-z0-9-]+)\)/g)) {
      expect(known, `tailwind.css references unknown --${name}`).toContain(
        name,
      );
    }
  });

  it("exposes every brand, surface, text, border and status colour", () => {
    const colourTokens = tokenNames.filter((n) =>
      /^(brand|surface|text|border|status)-/.test(n),
    );
    for (const name of colourTokens) {
      expect(tailwindCss).toContain(`--color-${name}: var(--${name});`);
    }
  });
});

describe("cssVar", () => {
  it("wraps a token name", () => {
    expect(cssVar("brand-primary")).toBe("var(--brand-primary)");
  });
});
