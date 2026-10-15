import { fireEvent, render, screen } from "@testing-library/react";

import { PageHeader } from "../index";

describe("PageHeader", () => {
  it("renders the title, subtitle, and action content", () => {
    render(
      <PageHeader
        title="Dashboard"
        subtitle="Live network summary"
        actions={<button type="button">Export</button>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Live network summary")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("calls onSearch when the search input changes", () => {
    const onSearch = vi.fn();

    render(<PageHeader title="Agents" onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Abebe" },
    });

    expect(onSearch).toHaveBeenCalledWith("Abebe");
  });
});
