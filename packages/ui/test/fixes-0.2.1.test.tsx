import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";

import { NavMenu, PortalDetailSection, PortalFilterSelect } from "../src";

const src = join(import.meta.dirname, "..", "src");
const read = (file: string) => readFileSync(join(src, file), "utf8");
const zIndexes = (file: string) =>
  [...read(file).matchAll(/\bz-(\[\d+\]|\d+)/g)].map((m) => m[1]);

describe("0.2.1 fixes", () => {
  it("AC-02.5 floating layers stack above every overlay, so a popover, select or menu opened inside a dialog or drawer is visible", () => {
    // Overlays (and their backdrops) share one layer; whatever floats above them shares the next.
    for (const file of [
      "primitives/dialog.tsx",
      "primitives/sheet.tsx",
      "components/portal-confirm-dialog.tsx",
    ]) {
      expect(new Set(zIndexes(file)), file).toEqual(new Set(["50"]));
    }
    for (const file of [
      "primitives/popover.tsx",
      "primitives/select.tsx",
      "primitives/dropdown-menu.tsx",
      "primitives/tooltip.tsx",
    ]) {
      expect(new Set(zIndexes(file)), file).toEqual(new Set(["[60]"]));
    }
  });

  it("NavMenu: an `exact` entry is current only on its own path", () => {
    const items = [
      { label: "Overview", href: "/dashboard", exact: true },
      { label: "Regions", href: "/dashboard/regions" },
    ];
    const { rerender } = render(
      <NavMenu
        aria-label="Sections"
        items={items}
        currentPath="/dashboard/regions"
      />,
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "Regions" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    rerender(
      <NavMenu aria-label="Sections" items={items} currentPath="/dashboard/" />,
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("detail rows lay out by the width they are given (a container query), not the window", () => {
    const { container } = render(
      <PortalDetailSection
        bare
        groups={[{ fields: [{ label: "Agent code", value: "AG-1001" }] }]}
      />,
    );
    const dl = container.querySelector("dl")!;
    expect(dl.parentElement).toHaveClass("@container");
    expect(dl.className).toContain("@2xl:grid-cols-2");
    expect(dl.className).not.toMatch(/(^|\s)md:grid-cols-2/);
  });

  it("a filter select keeps its label on one line", () => {
    render(
      <PortalFilterSelect
        placeholder="Status"
        options={[{ label: "All statuses", value: "ALL" }]}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Status" });
    expect(trigger).toHaveClass("whitespace-nowrap", "shrink-0");
  });
});
