/** The npm registry for the `@kifiya` scope: the kifiya-ui project (id 1059). */
export const KIFIYA_REGISTRY =
  "https://gitlab.kifiya.et/api/v4/projects/1059/packages/npm/";

export const SCOPE_LINE = `@kifiya:registry=${KIFIYA_REGISTRY}`;

/** Stylesheet imports in the order they must appear (AC-05.2). */
export const STYLE_IMPORTS = {
  tailwind: '@import "tailwindcss";',
  tokens: '@import "@kifiya/tokens/tailwind.css";',
  ui: '@import "@kifiya/ui/styles.css";',
  flows: '@import "@kifiya/flows/styles.css";',
} as const;

export type StyleImport = keyof typeof STYLE_IMPORTS;

/** Where apps usually keep their global stylesheet, most likely first. */
export const STYLESHEET_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
  "src/index.css",
  "src/global.css",
];

export const KIT_PACKAGES = [
  "@kifiya/tokens",
  "@kifiya/ui",
  "@kifiya/hooks",
  "@kifiya/flows",
] as const;
