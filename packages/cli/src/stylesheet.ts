import { STYLE_IMPORTS, type StyleImport } from "./constants.js";

/** Which imports a stylesheet needs: flows only when the app uses @kifiya/flows. */
export function requiredImports(usesFlows: boolean): StyleImport[] {
  return usesFlows
    ? ["tailwind", "tokens", "ui", "flows"]
    : ["tailwind", "tokens", "ui"];
}

function lineIndex(lines: string[], key: StyleImport): number {
  const target = STYLE_IMPORTS[key].replace(/;$/, "");
  return lines.findIndex(
    (line) => line.trim().replace(/;\s*$/, "").replace(/'/g, '"') === target,
  );
}

export interface StylesheetProblem {
  kind: "missing" | "order";
  import: string;
}

/** Missing imports, and imports present but out of order. */
export function checkStylesheet(
  css: string,
  required: StyleImport[],
): StylesheetProblem[] {
  const lines = css.split("\n");
  const problems: StylesheetProblem[] = [];
  let lastIndex = -1;
  for (const key of required) {
    const index = lineIndex(lines, key);
    if (index === -1) {
      problems.push({ kind: "missing", import: STYLE_IMPORTS[key] });
      continue;
    }
    if (index < lastIndex) {
      problems.push({ kind: "order", import: STYLE_IMPORTS[key] });
    }
    lastIndex = Math.max(lastIndex, index);
  }
  return problems;
}

/**
 * The stylesheet with the required imports present and in order. Existing
 * kit import lines are moved into one block right after the Tailwind import
 * (added at the top if missing); every other line is kept as it was.
 * Idempotent: fixing an already-correct stylesheet returns it unchanged.
 */
export function fixStylesheet(css: string, required: StyleImport[]): string {
  if (checkStylesheet(css, required).length === 0) return css;

  const kitKeys = required.filter((key) => key !== "tailwind");
  const kitLines = new Set<string>(kitKeys.map((key) => STYLE_IMPORTS[key]));
  const isKitLine = (line: string) =>
    kitLines.has(
      line
        .trim()
        .replace(/'/g, '"')
        .replace(/;?\s*$/, ";"),
    );

  const rest = css.split("\n").filter((line) => !isKitLine(line));
  let tailwindAt = lineIndex(rest, "tailwind");
  if (tailwindAt === -1) {
    rest.unshift(STYLE_IMPORTS.tailwind);
    tailwindAt = 0;
  }
  rest.splice(tailwindAt + 1, 0, ...kitKeys.map((key) => STYLE_IMPORTS[key]));
  return rest.join("\n");
}

/**
 * Kit tokens the stylesheet declares itself (e.g. create-next-app's
 * `:root { --background: #ffffff }`). Declared after the kit's imports, they
 * win over the kit's light and dark values.
 */
export function tokenOverrides(css: string, tokenNames: string[]): string[] {
  const known = new Set(tokenNames);
  const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found = new Set<string>();
  for (const [, name] of code.matchAll(/(?:^|[\s;{])--([a-z0-9-]+)\s*:/g)) {
    if (known.has(name!)) found.add(name!);
  }
  return [...found];
}
