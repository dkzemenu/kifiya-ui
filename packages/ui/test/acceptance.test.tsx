import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { tokenNames } from "@kifiya/tokens";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";

import {
  KifiyaUIProvider,
  PortalButton,
  PortalConfirmDialog,
  PortalDrawer,
  PortalFilterSelect,
  PortalSidebarNavItem,
  PortalStatusChip,
  PortalTable,
  type KifiyaLinkProps,
  type PortalTableColumn,
} from "../src";

const srcRoot = join(import.meta.dirname, "..", "src");

function sourceFiles(dir = srcRoot): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

type Agent = { id: string; name: string };

const columns: PortalTableColumn<Agent>[] = [
  { id: "name", header: "Agent", accessorKey: "name", type: "text" },
];

describe("R-02 components", () => {
  it("AC-02.1 styles every component from @kifiya/tokens, with no literal colours", () => {
    const known = new Set(tokenNames);
    const literal =
      /#[0-9a-fA-F]{3,8}\b|rgba?\(\d|hsla?\(\d|\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/;

    for (const file of sourceFiles()) {
      const code = readFileSync(file, "utf8").replace(
        /\/\/.*|\/\*[\s\S]*?\*\//g,
        "",
      );
      const where = relative(srcRoot, file);

      expect(code, `literal colour in ${where}`).not.toMatch(literal);
      // Variables a file declares itself (e.g. Tailwind `[--cell-size:...]`) are local.
      const local = new Set(
        [...code.matchAll(/\[--([a-z0-9-]+):/g)].map((m) => m[1]),
      );
      for (const [, name] of code.matchAll(/\(--([a-z0-9-]+)\)/g)) {
        // Radix sets --radix-* at runtime on its own elements.
        if (local.has(name) || name!.startsWith("radix-")) continue;
        expect(
          known,
          `${where} uses --${name}, which @kifiya/tokens does not define`,
        ).toContain(name!);
      }
    }
  });

  describe("AC-02.2 navigates through the app's link component, never a framework router", () => {
    it("imports no framework router", () => {
      for (const file of sourceFiles()) {
        expect(readFileSync(file, "utf8"), relative(srcRoot, file)).not.toMatch(
          /from "(next|next\/[^"]*|react-router[^"]*|@remix-run\/[^"]*|next-themes)"/,
        );
      }
    });

    it("renders a plain <a> when the app supplies no link component", () => {
      render(
        <>
          <PortalButton href="/agents">Agents</PortalButton>
          <PortalSidebarNavItem
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
          />
        </>,
      );

      expect(screen.getByRole("link", { name: "Agents" })).toHaveAttribute(
        "href",
        "/agents",
      );
      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
        "href",
        "/dashboard",
      );
    });

    it("uses the link component the app supplies", () => {
      function AppLink(props: KifiyaLinkProps) {
        return <a data-app-link="" {...props} />;
      }

      render(
        <KifiyaUIProvider linkComponent={AppLink}>
          <PortalButton href="/agents">Agents</PortalButton>
          <PortalSidebarNavItem
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            active
          />
        </KifiyaUIProvider>,
      );

      expect(screen.getByRole("link", { name: "Agents" })).toHaveAttribute(
        "data-app-link",
      );
      const nav = screen.getByRole("link", { name: "Dashboard" });
      expect(nav).toHaveAttribute("data-app-link");
      expect(nav).toHaveAttribute("aria-current", "page");
    });
  });

  it("AC-02.3 reports page changes and shows only the rows the app gave it", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    // Page 1 of a 45-row result: the app fetched only these two rows.
    const page = [
      { id: "a1", name: "Abebe" },
      { id: "a2", name: "Zebib" },
    ];

    render(
      <PortalTable
        columns={columns}
        data={page}
        getRowId={(row) => row.id}
        pagination={{ page: 1, pageSize: 2, totalItems: 45 }}
        onPaginationChange={onPaginationChange}
      />,
    );

    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onPaginationChange).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 2 }),
    );
  });

  describe("AC-02.4 never shows a blank table body", () => {
    function bodyOf() {
      return screen.getAllByRole("rowgroup")[1]!;
    }

    it("shows skeleton rows while loading", () => {
      render(<PortalTable columns={columns} data={[]} isLoading />);
      expect(within(bodyOf()).getAllByRole("row").length).toBeGreaterThan(0);
      expect(
        bodyOf().querySelector('[data-slot="skeleton"], .animate-pulse'),
      ).not.toBeNull();
    });

    it("shows the app's error message as an alert", () => {
      render(
        <PortalTable
          columns={columns}
          data={[]}
          error="Agents could not be loaded."
        />,
      );
      expect(within(bodyOf()).getByRole("alert")).toHaveTextContent(
        "Agents could not be loaded.",
      );
    });

    it("shows the empty placeholder when there are no rows", () => {
      render(
        <PortalTable columns={columns} data={[]} placeholder="No agents yet" />,
      );
      expect(within(bodyOf()).getByText("No agents yet")).toBeInTheDocument();
    });
  });

  describe("AC-02.5 overlays work by keyboard, close on Escape and return focus", () => {
    async function expectEscapeReturnsFocus(
      trigger: HTMLElement,
      overlayRole: string,
    ) {
      const user = userEvent.setup();
      trigger.focus();
      await user.keyboard("{Enter}");
      expect(await screen.findByRole(overlayRole)).toBeInTheDocument();

      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByRole(overlayRole)).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(trigger).toHaveFocus());
    }

    it("drawer", async () => {
      function Harness() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button onClick={() => setOpen(true)}>Open drawer</button>
            <PortalDrawer open={open} onOpenChange={setOpen} title="Agent">
              <input aria-label="Name" />
            </PortalDrawer>
          </>
        );
      }
      render(<Harness />);
      await expectEscapeReturnsFocus(
        screen.getByRole("button", { name: "Open drawer" }),
        "dialog",
      );
    });

    it("confirm dialog", async () => {
      function Harness() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button onClick={() => setOpen(true)}>Delete</button>
            <PortalConfirmDialog
              open={open}
              onOpenChange={setOpen}
              title="Delete agent?"
              description="This cannot be undone."
              confirmLabel="Delete"
              onConfirm={() => setOpen(false)}
            />
          </>
        );
      }
      render(<Harness />);
      await expectEscapeReturnsFocus(
        screen.getByRole("button", { name: "Delete" }),
        "dialog",
      );
    });

    it("select", async () => {
      render(
        <PortalFilterSelect
          placeholder="Status"
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Pending", value: "PENDING" },
          ]}
        />,
      );
      await expectEscapeReturnsFocus(
        screen.getByRole("combobox", { name: "Status" }),
        "listbox",
      );
    });

    it("row actions menu", async () => {
      render(
        <PortalTable
          columns={[
            ...columns,
            {
              id: "actions",
              header: "",
              type: "actions",
              actions: [{ label: "Inspect", onClick: () => {} }],
            },
          ]}
          data={[{ id: "a1", name: "Abebe" }]}
          getRowId={(row) => row.id}
        />,
      );
      await expectEscapeReturnsFocus(
        screen.getByRole("button", { name: "Row actions" }),
        "menu",
      );
    });
  });

  it.each([
    ["success", "--status-success-soft"],
    ["warning", "--status-warning-soft"],
    ["danger", "--status-danger-soft"],
    ["neutral", "--status-neutral-soft"],
    ["processing", "--status-processing-soft"],
  ] as const)(
    "AC-02.6 a %s chip uses that tone's status tokens",
    (tone, token) => {
      render(<PortalStatusChip label={tone} tone={tone} />);
      expect(screen.getByText(tone).parentElement!.className).toContain(token);
    },
  );
});
