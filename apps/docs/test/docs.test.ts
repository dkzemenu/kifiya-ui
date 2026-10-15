import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import * as flows from "@kifiya/flows";
import * as hooks from "@kifiya/hooks";
import * as hooksQuery from "@kifiya/hooks/query";
import * as kit from "@kifiya/ui";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

function filesIn(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesIn(path, ext);
    return name.endsWith(ext) ? [path] : [];
  });
}

const exampleCode = filesIn(join(root, "examples"), ".tsx")
  .filter((f) => !f.endsWith("registry.generated.tsx"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
// Keys of the generated registry, read as text: the registry holds JSX and
// Next.js requires `jsx: preserve`, which the test runner cannot parse.
const registry = readFileSync(
  join(root, "examples/registry.generated.tsx"),
  "utf8",
);
const sources = registry.slice(registry.indexOf("export const sources"));
const definedExamples = [...sources.matchAll(/^  "([^"]+)":/gm)].map(
  (m) => m[1]!,
);

const pages = filesIn(join(root, "content"), ".mdx").map((f) =>
  readFileSync(f, "utf8"),
);
const usedExamples = new Set(
  pages.flatMap((page) =>
    [...page.matchAll(/<Example name="([^"]+)"/g)].map((m) => m[1]),
  ),
);

/**
 * Building blocks that other components render for you. Each is documented on
 * its parent's example rather than with an example of its own.
 */
const shownThroughParent: Record<string, string> = {
  SheetPortal: "SheetContent",
  SheetOverlay: "SheetContent",
  PortalTableRowRenderer: "PortalTable",
  TooltipProvider: "Tooltip",
  CalendarDayButton: "Calendar",
  // The sidebar on its own is the AppShell's left column.
  AppSidebar: "AppShell",
};

const isComponent = ([name, value]: [string, unknown]) =>
  /^[A-Z]/.test(name) &&
  (typeof value === "function" ||
    (typeof value === "object" && value !== null && "$$typeof" in value));

const componentExports = [...Object.entries(kit), ...Object.entries(flows)]
  .filter(isComponent)
  .map(([name]) => name);

const hookExports = [...Object.entries(hooks), ...Object.entries(hooksQuery)]
  .filter(
    ([name, value]) => /^use[A-Z]/.test(name) && typeof value === "function",
  )
  .map(([name]) => name);

describe("R-04 documentation", () => {
  it.each(componentExports)(
    "AC-04.1 %s has a live example on a docs page",
    (name) => {
      const documentedAs = shownThroughParent[name] ?? name;
      // `<Name>`, `<Name prop>` or `<Name<Type>` (a generic component).
      expect(exampleCode).toMatch(new RegExp(`<${documentedAs}[\\s></]`));
      if (name in shownThroughParent) {
        expect(
          exampleCode,
          `the ${documentedAs} example should mention ${name}`,
        ).toContain(name);
      }
    },
  );

  it.each(hookExports)(
    "AC-04.1 %s has a live example on a docs page",
    (name) => {
      // `useX(` or `useX<Type>(`.
      expect(exampleCode).toMatch(new RegExp(`\\b${name}[<(]`));
    },
  );

  it("AC-04.1 every example is on a page, and every page's example exists", () => {
    const defined = definedExamples;
    expect(defined.length).toBeGreaterThan(40);
    expect(defined.filter((key) => !usedExamples.has(key))).toEqual([]);
    expect([...usedExamples].filter((key) => !defined.includes(key!))).toEqual(
      [],
    );
  });

  it("AC-04.2 the site's theme switch toggles the .dark class the tokens respond to", () => {
    const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
    expect(layout).toMatch(/nextThemes=\{\{[^}]*attribute:\s*"class"/);

    // Examples inherit the page's mode; none may pin one.
    const example = readFileSync(join(root, "components/example.tsx"), "utf8");
    expect(example).not.toMatch(/["'\s]dark["'\s:]/);
  });

  it("AC-04.2 the site loads the kit's styles the way an app does", () => {
    const css = readFileSync(join(root, "app/globals.css"), "utf8");
    expect(css).toContain('@import "@kifiya/tokens/tailwind.css";');
    expect(css).toContain('@import "@kifiya/ui/styles.css";');
  });
});
