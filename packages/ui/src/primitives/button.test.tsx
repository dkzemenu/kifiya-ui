import { render, screen } from "@testing-library/react";

import { Button, buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("returns the default button classes when no variants are provided", () => {
    const classes = buttonVariants();

    expect(classes).toContain("bg-primary");
    expect(classes).toContain("h-9");
    expect(classes).toContain("rounded-md");
  });

  it("returns outline classes for the outline variant", () => {
    const classes = buttonVariants({ variant: "outline" });

    expect(classes).toContain("border");
    expect(classes).toContain("bg-background");
    expect(classes).toContain("hover:bg-accent");
  });

  it("returns icon sizing classes for the icon size", () => {
    const classes = buttonVariants({ size: "icon" });

    expect(classes).toContain("size-9");
  });
});

describe("Button", () => {
  it("renders a native button element with the supplied content", () => {
    render(<Button>Export CSV</Button>);

    expect(
      screen.getByRole("button", { name: "Export CSV" }),
    ).toBeInTheDocument();
  });
});
