/**
 * Builds dist/data.json, everything the MCP server answers from (D-014):
 *  - components: every component @kifiya/ui (and its chart entry) and
 *    @kifiya/flows export, with
 *    props read from their published type declarations, a description, the
 *    docs examples that use them, and their docs page;
 *  - tokens: every token with its light and dark values and Tailwind utility;
 *  - guides: the docs' installation and app-setup pages.
 * Run after the packages and the docs examples are built (`pnpm build`).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");
const docs = join(repo, "apps", "docs");

// ---------- docs examples and pages ----------

execFileSync("node", [join(docs, "scripts", "generate-examples.mjs")], {
  stdio: "pipe",
});
const registry = readFileSync(
  join(docs, "examples", "registry.generated.tsx"),
  "utf8",
);
const sourcesBlock = registry.slice(registry.indexOf("export const sources"));
/** example key → source code */
const exampleSources = Object.fromEntries(
  [...sourcesBlock.matchAll(/^ {2}("[^"]+"): (".*"),$/gm)].map((m) => [
    JSON.parse(m[1]),
    JSON.parse(m[2]),
  ]),
);

/** example key → { page, heading, description } from the MDX that shows it */
const exampleDocs = {};
const pages = {};
function walk(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) walk(path);
    else if (name.name.endsWith(".mdx")) {
      const route =
        `/${relative(join(docs, "content"), path).replace(/(index)?\.mdx$/, "")}`.replace(
          /\/$/,
          "",
        ) || "/";
      const text = readFileSync(path, "utf8");
      pages[route] = text;
      let heading = "";
      let paragraph = "";
      for (const block of text.split(/\n\s*\n/)) {
        const h = block.match(/^##\s+(.+)$/m);
        if (h) {
          heading = h[1].trim();
          paragraph = "";
          continue;
        }
        const ex = block.match(/<Example name="([^"]+)"/);
        if (ex) {
          exampleDocs[ex[1]] = { page: route, heading, description: paragraph };
        } else if (
          !block.trim().startsWith("<") &&
          !block.trim().startsWith("```")
        ) {
          paragraph = block.trim();
        }
      }
    }
  }
}
walk(join(docs, "content"));

// ---------- components, from the published declarations ----------

const packages = [
  {
    name: "@kifiya/ui",
    dts: join(repo, "packages", "ui", "dist", "index.d.ts"),
  },
  {
    name: "@kifiya/ui/chart",
    dts: join(repo, "packages", "ui", "dist", "chart.d.ts"),
  },
  {
    name: "@kifiya/flows",
    dts: join(repo, "packages", "flows", "dist", "index.d.ts"),
  },
];

const program = ts.createProgram(
  packages.map((p) => p.dts),
  {
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
);
const checker = program.getTypeChecker();
const kitFiles = new Set(packages.map((p) => p.dts));

const docText = (symbol) =>
  ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();

/** Short prop list: the kit's own props, not the hundreds inherited from HTML or Radix. */
function propsOf(type) {
  // Props that differ by variant (`type="donut"` vs a cartesian chart) are a
  // union: list every member's props, joining their types, and mark a prop
  // required only when every member requires it.
  if (type.isUnion() && type.types.some((t) => t.getProperties().length)) {
    const members = type.types.map((member) => propsOf(member));
    const merged = new Map();
    for (const { props } of members) {
      for (const prop of props) {
        const seen = merged.get(prop.name);
        if (!seen)
          merged.set(prop.name, {
            ...prop,
            types: new Set([prop.type]),
            count: 1,
          });
        else {
          seen.types.add(prop.type);
          seen.required &&= prop.required;
          seen.count++;
        }
      }
    }
    const props = [...merged.values()]
      .map(({ types, count, ...prop }) => ({
        ...prop,
        type: [...types].join(" | "),
        required: prop.required && count === members.length,
      }))
      .sort(
        (a, b) =>
          Number(b.required) - Number(a.required) ||
          a.name.localeCompare(b.name),
      );
    return { props, inheritsHtml: members.some((m) => m.inheritsHtml) };
  }
  const all = checker.getPropertiesOfType(type);
  const own = all.filter((p) =>
    p.declarations?.some((d) => kitFiles.has(d.getSourceFile().fileName)),
  );
  const chosen = all.length <= 25 ? all : own;
  const props = chosen
    .filter((p) => !p.name.startsWith("__"))
    .map((p) => {
      const decl = p.valueDeclaration ?? p.declarations?.[0];
      const propType = decl
        ? checker.getTypeOfSymbolAtLocation(p, decl)
        : checker.getDeclaredTypeOfSymbol(p);
      return {
        name: p.name,
        type: checker
          .typeToString(propType, undefined, ts.TypeFormatFlags.NoTruncation)
          .replace(/\s+/g, " "),
        required: !(p.flags & ts.SymbolFlags.Optional),
        description: docText(p) || undefined,
      };
    })
    .sort(
      (a, b) =>
        Number(b.required) - Number(a.required) || a.name.localeCompare(b.name),
    );
  return { props, inheritsHtml: chosen.length < all.length };
}

/**
 * Building blocks other components render for you; documented on their
 * parent's example (the same list as apps/docs/test/docs.test.ts).
 */
const shownThroughParent = {
  SheetPortal: "SheetContent",
  SheetOverlay: "SheetContent",
  PortalTableRowRenderer: "PortalTable",
  TooltipProvider: "Tooltip",
  CalendarDayButton: "Calendar",
  AppSidebar: "AppShell",
};

const uses = (name, key) =>
  (exampleSources[key].match(new RegExp(`<${name}[\\s></]`, "g")) ?? []).length;

/** Examples using `name`, most central first: a heading naming it, then most uses. */
function examplesFor(name) {
  const heading = (key) => exampleDocs[key]?.heading ?? "";
  const rank = (key) =>
    (heading(key) === name ? 1000 : 0) +
    (heading(key).startsWith(name) ? 500 : 0) +
    uses(name, key);
  return Object.keys(exampleSources)
    .filter((key) => uses(name, key) > 0)
    .sort((a, b) => rank(b) - rank(a));
}

const components = [];
for (const pkg of packages) {
  const file = program.getSourceFile(pkg.dts);
  const moduleSymbol = checker.getSymbolAtLocation(file);
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol =
      exported.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(exported)
        : exported;
    const name = exported.name;
    if (
      !/^[A-Z]/.test(name) ||
      !(symbol.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))
    )
      continue;
    const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!decl) continue;
    const signature = checker
      .getTypeOfSymbolAtLocation(symbol, decl)
      .getCallSignatures()[0];
    if (!signature) continue;

    const firstParam = signature.getParameters()[0];
    const { props, inheritsHtml } = firstParam
      ? propsOf(checker.getTypeOfSymbolAtLocation(firstParam, decl))
      : { props: [], inheritsHtml: false };

    const parent = shownThroughParent[name];
    const examples = examplesFor(parent ?? name);
    const best = examples[0];
    const bestHeading = exampleDocs[best]?.heading ?? "";
    const fallback = parent
      ? `Rendered for you by ${parent}; exported for custom compositions.`
      : bestHeading.startsWith(name)
        ? exampleDocs[best]?.description
        : bestHeading
          ? `Part of ${bestHeading}. ${exampleDocs[best]?.description ?? ""}`.trim()
          : "";

    components.push({
      name,
      package: pkg.name,
      description: docText(symbol) || fallback || "",
      docsPage: exampleDocs[best]?.page,
      props,
      inheritsHtml,
      examples: examples
        .slice(0, 3)
        .map((key) => ({ key, code: exampleSources[key] })),
    });
  }
}

// ---------- tokens ----------

const tokensDist = join(repo, "packages", "tokens", "dist");
const { themes } = JSON.parse(
  readFileSync(join(tokensDist, "tokens.json"), "utf8"),
);
const tailwindCss = readFileSync(join(tokensDist, "tailwind.css"), "utf8");
const utilities = {};
for (const [, color, token] of tailwindCss.matchAll(
  /--color-([a-z0-9-]+): var\(--([a-z0-9-]+)\)/g,
)) {
  utilities[token] = [`bg-${color}`, `text-${color}`, `border-${color}`];
}
for (const [, utility, token] of tailwindCss.matchAll(
  /@utility ([a-z0-9-]+) \{\s*[a-z-]+: var\(--([a-z0-9-]+)\)/g,
)) {
  (utilities[token] ??= []).push(utility);
}
const theme = themes[0];
const tokens = [
  ...Object.entries(theme.base).map(([name, value]) => ({
    name,
    light: value,
    dark: value,
  })),
  ...Object.entries(theme.light).map(([name, value]) => ({
    name,
    light: value,
    dark: theme.dark[name],
  })),
].map((t) => ({
  ...t,
  cssVar: `var(--${t.name})`,
  utilities: utilities[t.name] ?? [],
}));

// ---------- write ----------

const version = JSON.parse(
  readFileSync(join(here, "..", "package.json"), "utf8"),
).version;
const data = {
  version,
  components: components.sort((a, b) => a.name.localeCompare(b.name)),
  tokens,
  guides: {
    installation: pages["/getting-started/installation"],
    appSetup: pages["/getting-started/app-setup"],
    theming: pages["/getting-started/theming"],
  },
};
mkdirSync(join(here, "..", "dist"), { recursive: true });
writeFileSync(join(here, "..", "dist", "data.json"), JSON.stringify(data));
console.log(
  `@kifiya/mcp: ${components.length} components, ${tokens.length} tokens, ` +
    `${components.filter((c) => c.examples.length).length} with examples`,
);
