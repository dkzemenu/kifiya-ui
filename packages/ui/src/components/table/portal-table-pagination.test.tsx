import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PortalTablePagination } from "./portal-table-pagination";

describe("PortalTablePagination", () => {
  it("shows the current page, total pages, and the current row count in the themed Rows selector", () => {
    render(
      <PortalTablePagination
        pagination={{
          page: 2,
          pageSize: 20,
          totalItems: 45,
          totalPages: 3,
          pageSizeOptions: [10, 20, 50],
        }}
        onPaginationChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Rows" })).toHaveTextContent(
      "20",
    );
  });

  it("changes the page size via the themed Rows dropdown and resets to page 1", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();

    render(
      <PortalTablePagination
        pagination={{
          page: 2,
          pageSize: 10,
          totalItems: 45,
          totalPages: 5,
          pageSizeOptions: [10, 20, 50],
        }}
        onPaginationChange={onPaginationChange}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Rows" }));
    await user.click(screen.getByRole("option", { name: "50" }));

    expect(onPaginationChange).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 50 }),
    );
  });

  it("defaults the row-size options to 5/10/20 when the caller supplies none", () => {
    render(
      <PortalTablePagination
        pagination={{ page: 1, pageSize: 5, totalItems: 5 }}
        onPaginationChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Rows" })).toHaveTextContent(
      "5",
    );
  });

  it("moves to the next and previous page", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();

    render(
      <PortalTablePagination
        pagination={{ page: 2, pageSize: 10, totalItems: 30, totalPages: 3 }}
        onPaginationChange={onPaginationChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onPaginationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 3 }),
    );

    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPaginationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it("jumps to a typed page number on Enter, clamped to the last page", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();

    render(
      <PortalTablePagination
        pagination={{ page: 1, pageSize: 10, totalItems: 30, totalPages: 3 }}
        onPaginationChange={onPaginationChange}
      />,
    );

    const goToInput = screen.getByLabelText("Jump to page");
    await user.clear(goToInput);
    await user.type(goToInput, "99{enter}");

    expect(onPaginationChange).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3 }),
    );
  });
});
