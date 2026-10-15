import { render, screen } from "@testing-library/react";

import { PortalStatusChip } from "../index";

describe("PortalStatusChip", () => {
  it("renders the supplied label", () => {
    render(<PortalStatusChip label="Healthy" tone="success" />);

    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("applies semantic tone styles", () => {
    const { container } = render(
      <PortalStatusChip label="Alert" tone="danger" />,
    );

    expect(container.firstChild).toHaveClass("bg-[var(--status-danger-soft)]");
  });
});
