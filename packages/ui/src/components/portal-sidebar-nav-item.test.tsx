import { render, screen } from "@testing-library/react";

import { PortalSidebarNavItem } from "../index";
import { ChartColumnIncreasing } from "lucide-react";

describe("PortalSidebarNavItem", () => {
  it("renders a link with its label", () => {
    render(
      <PortalSidebarNavItem
        href="/dashboard"
        label="Overview"
        icon={ChartColumnIncreasing}
      />,
    );

    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("sets aria-current for the active route", () => {
    render(
      <PortalSidebarNavItem
        href="/dashboard"
        label="Overview"
        icon={ChartColumnIncreasing}
        active
      />,
    );

    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
