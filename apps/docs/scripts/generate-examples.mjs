/**
 * Builds examples/registry.generated.tsx from examples/*.tsx:
 *  - `examples`: "<file>/<ExportName>" → the live component (Preview tab);
 *  - `sources`: the same key → a self-contained snippet for the Code tab:
 *    only the imports, helpers and function that example actually uses.
 * Every exported function in an example file is an example.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "examples");
const OUT = "registry.generated.tsx";

/** Splits source into top-level statements, leading comments attached. */
function statements(code) {
  const out = [];
  let i = 0;
  while (i < code.length) {
    while (i < code.length && /\s/.test(code[i])) i++;
    if (i >= code.length) break;
    const start = i;
    // Leading comments belong to the next statement.
    for (;;) {
      if (code.startsWith("//", i))
        i = code.indexOf("\n", i) + 1 || code.length;
      else if (code.startsWith("/*", i)) i = code.indexOf("*/", i) + 2;
      else break;
      while (i < code.length && /\s/.test(code[i])) i++;
    }
    const head = code.slice(i, i + 40);
    const isFunction = /^(export\s+)?(async\s+)?function\b/.test(head);
    let depth = 0;
    for (; i < code.length; i++) {
      const c = code[i];
      if (c === '"' || c === "'" || c === "`") {
        const q = c;
        for (i++; i < code.length && code[i] !== q; i++)
          if (code[i] === "\\") i++;
        continue;
      }
      if (code.startsWith("//", i)) {
        i = code.indexOf("\n", i);
        continue;
      }
      if (code.startsWith("/*", i)) {
        i = code.indexOf("*/", i) + 1;
        continue;
      }
      if ("([{".includes(c)) depth++;
      else if (")]}".includes(c)) {
        depth--;
        if (depth === 0 && c === "}" && isFunction) {
          i++;
          break;
        }
      } else if (c === ";" && depth === 0) {
        i++;
        break;
      }
    }
    out.push(code.slice(start, i).trim());
  }
  return out;
}

// Identifiers in code, ignoring comments (a name in a comment is not a use).
const identifiers = (text) =>
  new Set(
    text
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")
      .match(/\b[A-Za-z_$][\w$]*\b/g) ?? [],
  );

function declaredName(stmt) {
  const body = stmt.replace(/^(\s*(\/\/.*|\/\*[\s\S]*?\*\/)\s*)*/, "");
  return body.match(
    /^(?:export\s+)?(?:const|let|type|interface|function|class)\s+([A-Za-z_$][\w$]*)/,
  )?.[1];
}

/** Keeps only the import specifiers `used` references. */
function filterImport(stmt, used) {
  const named = stmt.match(
    /import\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+("[^"]+")/,
  );
  if (named) {
    const keep = named[2]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((spec) =>
        used.has(
          spec
            .split(/\s+as\s+/)
            .pop()
            .replace(/^type\s+/, ""),
        ),
      );
    if (!keep.length) return null;
    const one = `import ${named[1] ?? ""}{ ${keep.join(", ")} } from ${named[3]};`;
    return one.length <= 80
      ? one
      : `import ${named[1] ?? ""}{\n${keep.map((k) => `  ${k},`).join("\n")}\n} from ${named[3]};`;
  }
  const local = stmt.match(/import\s+(?:\*\s+as\s+)?([A-Za-z_$][\w$]*)/)?.[1];
  return local && used.has(local) ? stmt : null;
}

const files = readdirSync(dir)
  .filter((f) => f.endsWith(".tsx") && f !== OUT)
  .sort();
const entries = [];

for (const file of files) {
  const group = file.replace(/\.tsx$/, "");
  const code = readFileSync(join(dir, file), "utf8").replace(
    /^"use client";\s*/,
    "",
  );
  const stmts = statements(code);
  const imports = stmts.filter((s) => s.startsWith("import "));
  const decls = stmts.filter((s) => !s.startsWith("import "));
  const helpers = new Map(
    decls
      .filter((s) => !/^(?:\/\*[\s\S]*?\*\/\s*)?export function/.test(s))
      .map((s) => [declaredName(s), s]),
  );

  for (const stmt of decls) {
    const name = stmt.match(/export function ([A-Z]\w*)/)?.[1];
    if (!name || !/^(?:\/\*[\s\S]*?\*\/\s*)?export function/.test(stmt))
      continue;

    // Helpers the example uses, transitively, in file order.
    const needed = new Set();
    const queue = [stmt];
    while (queue.length) {
      for (const id of identifiers(queue.pop())) {
        if (helpers.has(id) && !needed.has(id)) {
          needed.add(id);
          queue.push(helpers.get(id));
        }
      }
    }
    const body = [...helpers].filter(([n]) => needed.has(n)).map(([, s]) => s);
    const used = identifiers([...body, stmt].join("\n"));
    const usedImports = imports
      .map((s) => filterImport(s, used))
      .filter(Boolean);

    const source = [usedImports.join("\n"), ...body, stmt]
      .filter(Boolean)
      .join("\n\n");
    entries.push({
      key: `${group}/${name}`,
      group,
      name,
      source: `${source}\n`,
    });
  }
}

const ident = (g) => `ex_${g.replace(/\W/g, "_")}`;
const out = `// Generated by scripts/generate-examples.mjs. Do not edit.
"use client";

import type { ComponentType } from "react";

${files.map((f) => `import * as ${ident(f.replace(/\.tsx$/, ""))} from "./${f.replace(/\.tsx$/, "")}";`).join("\n")}

export const examples: Record<string, ComponentType> = {
${entries.map((e) => `  ${JSON.stringify(e.key)}: ${ident(e.group)}.${e.name},`).join("\n")}
};

export const sources: Record<string, string> = {
${entries.map((e) => `  ${JSON.stringify(e.key)}: ${JSON.stringify(e.source)},`).join("\n")}
};
`;

writeFileSync(join(dir, OUT), out);
console.log(`docs: ${entries.length} examples from ${files.length} files`);
