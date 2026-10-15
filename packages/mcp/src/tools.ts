import type { ComponentInfo, KitData } from "./data.js";

function distance(a: string, b: string): number {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  const row = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(
        row[j]! + 1,
        row[j - 1]! + 1,
        previous + (x[i - 1] === y[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[y.length]!;
}

/** The closest names to `query`: substring matches first, then by edit distance. */
export function closest(query: string, names: string[], count = 3): string[] {
  const q = query.toLowerCase();
  return [...names]
    .sort((a, b) => {
      const sa =
        a.toLowerCase().includes(q) || q.includes(a.toLowerCase()) ? 0 : 1;
      const sb =
        b.toLowerCase().includes(q) || q.includes(b.toLowerCase()) ? 0 : 1;
      return sa - sb || distance(q, a) - distance(q, b);
    })
    .slice(0, count);
}

export function listComponents(data: KitData, pkg?: string): string {
  const rows = data.components.filter((c) => !pkg || c.package === pkg);
  // One line per component: the first sentence, plus the next while it is
  // too short to say what the component is (e.g. "KPI tiles.").
  const firstLine = (text: string) => {
    const sentences = text.replace(/\s+/g, " ").split(/(?<=\.)\s/);
    let line = sentences.shift() ?? "";
    while (line.length < 40 && sentences.length)
      line += ` ${sentences.shift()}`;
    return line;
  };
  return [
    `Kifiya UI kit ${data.version}: ${rows.length} components.`,
    ...rows.map(
      (c) => `- ${c.name} (${c.package}): ${firstLine(c.description)}`,
    ),
  ].join("\n");
}

function describeComponent(c: ComponentInfo): string {
  const props = c.props.length
    ? c.props.map(
        (p) =>
          `- \`${p.name}${p.required ? "" : "?"}: ${p.type}\`${p.description ? ` — ${p.description.replace(/\s+/g, " ")}` : ""}`,
      )
    : ["- (no props of its own)"];
  return [
    `# ${c.name}`,
    `Import: \`import { ${c.name} } from "${c.package}";\``,
    c.docsPage ? `Docs page: ${c.docsPage}` : "",
    "",
    c.description,
    "",
    "## Props",
    ...props,
    c.inheritsHtml
      ? "\nAlso accepts the standard props of the element or Radix part it renders."
      : "",
    ...c.examples.flatMap((e) => [
      "",
      `## Example (${e.key})`,
      "```tsx",
      e.code.trimEnd(),
      "```",
    ]),
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");
}

/** A component's props and examples, or a "not in the kit" answer with suggestions (AC-06.4). */
export function getComponent(
  data: KitData,
  name: string,
): { found: boolean; text: string } {
  const component = data.components.find((c) => c.name === name.trim());
  if (component) return { found: true, text: describeComponent(component) };
  const caseInsensitive = data.components.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
  );
  const suggestions = caseInsensitive
    ? [caseInsensitive.name]
    : closest(
        name,
        data.components.map((c) => c.name),
      );
  return {
    found: false,
    text:
      `"${name}" is not a component the Kifiya UI kit exports (version ${data.version}). ` +
      `Closest names: ${suggestions.join(", ")}. ` +
      "Do not invent it; use one of these or build it from the kit's primitives.",
  };
}

/** Tokens whose name, value or utility contains every word of the query (AC-06.3). */
export function searchTokens(data: KitData, query: string): string {
  const words = query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  const matches = data.tokens.filter((t) => {
    const haystack = [t.name, t.light, t.dark, ...t.utilities]
      .join(" ")
      .toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
  if (!matches.length) {
    return `No token matches "${query}". Closest token names: ${closest(
      query,
      data.tokens.map((t) => t.name),
      5,
    ).join(", ")}.`;
  }
  return [
    `${matches.length} token(s). Use the utility (Tailwind) or the CSS variable; never the literal value.`,
    ...matches.map(
      (t) =>
        `- ${t.name}: light ${t.light}, dark ${t.dark}; ${t.cssVar}` +
        (t.utilities.length ? `; utilities: ${t.utilities.join(", ")}` : ""),
    ),
  ].join("\n");
}

export function setupGuide(data: KitData): string {
  return [data.guides.installation, data.guides.appSetup, data.guides.theming]
    .filter(Boolean)
    .join("\n\n---\n\n");
}
