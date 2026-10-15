import { kifiyaTheme } from "./themes/kifiya.js";
import type { ThemeDefinition } from "./types.js";

export type { ThemeDefinition, TokenMap } from "./types.js";
export { renderVariablesCss } from "./css.js";
export { kifiyaTheme };

/** Every theme the kit ships. The first one is the default. */
export const themes: readonly ThemeDefinition[] = [kifiyaTheme];

export type ThemeName = (typeof themes)[number]["name"];
export type ColorMode = "light" | "dark";

/** Every token name, without the leading `--`. */
export const tokenNames: readonly string[] = [
  ...Object.keys(kifiyaTheme.base),
  ...Object.keys(kifiyaTheme.light),
];

/** `cssVar("brand-primary")` → `"var(--brand-primary)"`. */
export function cssVar(name: string): string {
  return `var(--${name})`;
}
