import { render, screen } from "@testing-library/react";

import { PortalButton, portalButtonVariants } from "../index";

describe("portalButtonVariants", () => {
  it("returns primary button classes by default", () => {
    const classes = portalButtonVariants();

    expect(classes).toContain("bg-[var(--brand-primary)]");
    expect(classes).toContain("h-11");
  });

  it("returns outline classes for the outline variant", () => {
    const classes = portalButtonVariants({ variant: "outline" });

    expect(classes).toContain("border-[var(--border-muted)]");
    expect(classes).toContain("bg-[var(--surface-card)]");
  });
});

describe("PortalButton", () => {
  it("renders button content", () => {
    render(<PortalButton>Share</PortalButton>);

    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });

  it("disables the button while loading", () => {
    render(<PortalButton loading>Sync</PortalButton>);

    expect(screen.getByRole("button", { name: "Sync" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sync" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});
