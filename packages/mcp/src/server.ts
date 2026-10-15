import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { loadData, type KitData } from "./data.js";
import {
  getComponent,
  listComponents,
  searchTokens,
  setupGuide,
} from "./tools.js";

const text = (value: string, isError = false) => ({
  content: [{ type: "text" as const, text: value }],
  ...(isError ? { isError: true } : {}),
});

/** The kit's MCP server. Answers only from data built into this release. */
export function createServer(data: KitData = loadData()): McpServer {
  const server = new McpServer({ name: "kifiya-ui", version: data.version });

  server.registerTool(
    "list_components",
    {
      title: "List Kifiya UI components",
      description:
        "Lists every component the Kifiya UI kit exports (@kifiya/ui, @kifiya/flows) with a one-line description. Use before writing UI in a Kifiya app.",
      inputSchema: {
        package: z
          .enum(["@kifiya/ui", "@kifiya/flows"])
          .optional()
          .describe("Only this package"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ package: pkg }) => text(listComponents(data, pkg)),
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a Kifiya UI component",
      description:
        "A component's import, props with types, and working example code from the docs. Says so when the kit has no such component.",
      inputSchema: {
        name: z.string().describe("Exact component name, e.g. PortalTable"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ name }) => {
      const result = getComponent(data, name);
      return text(result.text, !result.found);
    },
  );

  server.registerTool(
    "search_tokens",
    {
      title: "Search Kifiya design tokens",
      description:
        "Finds design tokens (colours, radii, shadows, fonts) by name or value, with light and dark values and the Tailwind utility to use instead of a literal.",
      inputSchema: {
        query: z.string().describe('e.g. "danger", "brand primary", "radius"'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query }) => text(searchTokens(data, query)),
  );

  server.registerTool(
    "get_setup_guide",
    {
      title: "Kifiya UI setup guide",
      description:
        "How to install the kit in an app: registry, packages, stylesheet imports, provider, theming.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => text(setupGuide(data)),
  );

  return server;
}
