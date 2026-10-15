import { readFileSync } from "node:fs";

export interface Prop {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ComponentInfo {
  name: string;
  package: string;
  description: string;
  docsPage?: string;
  props: Prop[];
  /** True when only the kit's own props are listed; standard HTML/Radix props also apply. */
  inheritsHtml: boolean;
  examples: { key: string; code: string }[];
}

export interface TokenInfo {
  name: string;
  light: string;
  dark: string;
  cssVar: string;
  utilities: string[];
}

export interface KitData {
  version: string;
  components: ComponentInfo[];
  tokens: TokenInfo[];
  guides: Record<string, string | undefined>;
}

/** The data built into this release (scripts/build-data.mjs); never fetched (AC-06.5). */
export function loadData(): KitData {
  return JSON.parse(
    readFileSync(new URL("./data.json", import.meta.url), "utf8"),
  ) as KitData;
}
