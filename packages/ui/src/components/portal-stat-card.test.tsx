import { render, screen } from "@testing-library/react";
import { Bell } from "lucide-react";

import { PortalStatCard } from "../index";

describe("PortalStatCard", () => {
  it("renders metric content", () => {
    render(
      <PortalStatCard
        label="Completed"
        value="415"
        subtitle="Up from yesterday"
      />,
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("415")).toBeInTheDocument();
    expect(screen.getByText("Up from yesterday")).toBeInTheDocument();
  });

  it("renders the icon and tone styles", () => {
    const { container } = render(
      <PortalStatCard label="Completed" value="415" icon={Bell} tone="brand" />,
    );

    expect(container.firstChild).toHaveClass("bg-[var(--brand-primary)]");
    expect(document.querySelector("svg")).toBeInTheDocument();
  });
});
