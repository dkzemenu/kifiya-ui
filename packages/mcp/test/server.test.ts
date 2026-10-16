import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");
const repo = join(root, "..", "..");

let client: Client;

/** Text of a tool result. */
async function call(name: string, args: Record<string, unknown> = {}) {
  const result = (await client.callTool({ name, arguments: args })) as {
    content: { type: string; text: string }[];
    isError?: boolean;
  };
  return {
    text: result.content.map((c) => c.text).join("\n"),
    isError: Boolean(result.isError),
  };
}

/** Component names a package exports, read from its published declarations. */
function exportedComponents(pkg: "ui" | "flows", entry = "index"): string[] {
  const dts = readFileSync(
    join(repo, "packages", pkg, "dist", `${entry}.d.ts`),
    "utf8",
  );
  const exportList = [...dts.matchAll(/export \{([^}]*)\}/g)].flatMap((m) =>
    m[1]!.split(",").map((s) =>
      s
        .trim()
        .split(/\s+as\s+/)
        .pop()!
        .replace(/^type\s+/, ""),
    ),
  );
  const functions = new Set(
    [...dts.matchAll(/declare (?:function|const) ([A-Z][a-z]\w*)/g)].map(
      (m) => m[1]!,
    ),
  );
  return exportList.filter((name) => functions.has(name));
}

beforeAll(async () => {
  // The real server, started the way an assistant starts it (`npx @kifiya/mcp`).
  client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: "node",
      args: [join(root, "dist", "bin.js")],
    }),
  );
});

afterAll(async () => {
  await client.close();
});

describe("R-06 MCP server", () => {
  it("offers the four lookup tools, all read-only", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "get_component",
      "get_setup_guide",
      "list_components",
      "search_tokens",
    ]);
    for (const tool of tools) expect(tool.annotations?.readOnlyHint).toBe(true);
  });

  it("AC-06.1 lists every component @kifiya/ui and @kifiya/flows export, each with a description", async () => {
    const { text } = await call("list_components");
    const expected = [
      ...exportedComponents("ui"),
      ...exportedComponents("ui", "chart"),
      ...exportedComponents("flows"),
    ];
    expect(expected.length).toBeGreaterThan(90);
    for (const name of expected) {
      const line = text.split("\n").find((l) => l.startsWith(`- ${name} (`));
      expect(line, `${name} is listed`).toBeDefined();
      expect(
        line!.split("): ")[1]!.trim().length,
        `${name} has a description`,
      ).toBeGreaterThan(10);
    }
  });

  it("AC-06.2 returns a component's props with types and its docs example code", async () => {
    const { text, isError } = await call("get_component", {
      name: "PortalTable",
    });
    expect(isError).toBe(false);
    expect(text).toContain('import { PortalTable } from "@kifiya/ui";');
    expect(text).toContain("`columns: PortalTableColumn<T>[]`");
    expect(text).toContain("`onPaginationChange?:");
    expect(text).toContain("```tsx");
    expect(text).toContain("<PortalTable");
    expect(text).toContain("Docs page: /components/data-table");
  });

  it("AC-06.2 includes prop descriptions for flows", async () => {
    const { text } = await call("get_component", { name: "PermissionGuard" });
    expect(text).toContain("`require: PermissionRequirement`");
    expect(text).toMatch(
      /`loading\?: ReactNode` — Shown while permissions load/,
    );
  });

  it("AC-06.3 a token search returns light and dark values and the utility to use", async () => {
    const { text } = await call("search_tokens", {
      query: "status danger soft",
    });
    expect(text).toContain(
      "status-danger-soft: light #fee2e2, dark color-mix(in srgb, #f87171 18%, transparent)",
    );
    expect(text).toContain("bg-status-danger-soft");
    expect(text).toContain("var(--status-danger-soft)");
  });

  it("AC-06.3 finds radius and shadow utilities too", async () => {
    expect(
      (await call("search_tokens", { query: "radius-card" })).text,
    ).toContain("rounded-card");
    expect(
      (await call("search_tokens", { query: "shadow-drawer" })).text,
    ).toContain("shadow-drawer");
  });

  describe("AC-06.4 a name the kit does not export", () => {
    it("is reported as missing, with the closest names, not answered about something else", async () => {
      const { text, isError } = await call("get_component", {
        name: "PortalDataGrid",
      });
      expect(isError).toBe(true);
      expect(text).toContain(
        '"PortalDataGrid" is not a component the Kifiya UI kit exports',
      );
      expect(text).toMatch(/Closest names: .*Portal/);
      expect(text).not.toContain("## Props");
    });

    it("suggests the right name for a wrong case", async () => {
      const { text } = await call("get_component", { name: "portalbutton" });
      expect(text).toContain("Closest names: PortalButton");
    });

    it("says so for an unknown token", async () => {
      const { text } = await call("search_tokens", { query: "brand-tertiary" });
      expect(text).toContain('No token matches "brand-tertiary"');
    });
  });

  it("AC-06.5 answers from data built into the release, with no network code", () => {
    const data = JSON.parse(
      readFileSync(join(root, "dist", "data.json"), "utf8"),
    ) as { version: string };
    const pkg = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    ) as { version: string };
    expect(data.version).toBe(pkg.version);

    for (const file of [
      "bin.ts",
      "data.ts",
      "index.ts",
      "server.ts",
      "tools.ts",
    ]) {
      const code = readFileSync(join(root, "src", file), "utf8");
      expect(code, file).not.toMatch(
        /\bfetch\(|node:https?|node:net|XMLHttpRequest|WebSocket|axios|undici/,
      );
    }
  });

  it("serves the setup guide", async () => {
    const { text } = await call("get_setup_guide");
    expect(text).toContain('@import "@kifiya/ui/styles.css";');
    expect(text).toContain("KifiyaUIProvider");
  });
});
