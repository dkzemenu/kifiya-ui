import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("exposes an accessible checkbox role and label", () => {
    render(<Checkbox aria-label="Select agent" />);

    expect(
      screen.getByRole("checkbox", { name: "Select agent" }),
    ).toBeInTheDocument();
  });

  it("calls onCheckedChange with the next checked state when clicked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Checkbox
        aria-label="Select row"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Select row" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("applies the checked state to aria-checked", () => {
    render(<Checkbox aria-label="Select row" checked />);

    expect(screen.getByRole("checkbox", { name: "Select row" })).toBeChecked();
  });
});
