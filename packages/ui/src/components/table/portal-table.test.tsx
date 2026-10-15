import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  PortalTable,
  PortalTableCard,
  type PortalTableColumn,
} from "../../index";

interface TestRow {
  id: string;
  name: string;
  amount: string;
  status: "Healthy" | "Pending";
}

const rows: TestRow[] = [
  { id: "row-1", name: "Zebib", amount: "ETB 2,500", status: "Healthy" },
  { id: "row-2", name: "Abebe", amount: "ETB 1,900", status: "Pending" },
];

const columns: PortalTableColumn<TestRow>[] = [
  {
    id: "select",
    header: "",
    type: "selection",
    width: "56px",
  },
  {
    id: "name",
    header: "Agent",
    accessorKey: "name",
    type: "text",
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    type: "chip",
    getChip: (row) => ({
      label: row.status,
      tone: row.status === "Healthy" ? "success" : "warning",
    }),
  },
  {
    id: "actions",
    header: "",
    type: "actions",
    actions: (row) => [
      {
        label: `Inspect ${row.name}`,
        onClick: vi.fn(),
      },
    ],
  },
];

describe("PortalTableCard", () => {
  it("renders title, description, header action, and footer content", () => {
    render(
      <PortalTableCard
        title="Top Earning Agents"
        description="Commission earnings this month"
        columns={columns}
        data={rows}
        headerAction={<div>Total commission: ETB 65,930</div>}
        footerContent={<div>Showing 2 agents</div>}
        pagination={{ page: 1, pageSize: 5, totalItems: 2 }}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText("Top Earning Agents")).toBeInTheDocument();
    expect(
      screen.getByText("Commission earnings this month"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Total commission: ETB 65,930"),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 2 agents")).toBeInTheDocument();
  });
});

describe("PortalTable", () => {
  it("shows skeleton rows while loading and the empty placeholder otherwise", () => {
    const { rerender } = render(
      <PortalTable
        columns={columns}
        data={[]}
        isLoading
        placeholder="No rows found"
      />,
    );

    expect(
      screen.getAllByTestId("portal-table-skeleton-row").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("No rows found")).not.toBeInTheDocument();

    rerender(
      <PortalTable columns={columns} data={[]} placeholder="No rows found" />,
    );

    expect(screen.getByText("No rows found")).toBeInTheDocument();
    expect(
      screen.queryByTestId("portal-table-skeleton-row"),
    ).not.toBeInTheDocument();
  });

  it("supports row selection and notifies with selected rows", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <PortalTable
        columns={columns}
        data={rows}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    expect(onSelectionChange).toHaveBeenLastCalledWith(rows);
  });

  it("supports local sorting for sortable text columns", async () => {
    const user = userEvent.setup();

    render(
      <PortalTable columns={columns} data={rows} getRowId={(row) => row.id} />,
    );

    await user.click(screen.getByRole("button", { name: /agent/i }));

    const dataRows = screen.getAllByRole("row").slice(1, 3);
    expect(within(dataRows[0]!).getByText("Abebe")).toBeInTheDocument();
    expect(within(dataRows[1]!).getByText("Zebib")).toBeInTheDocument();
  });

  it("renders row actions and invokes pagination callbacks", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();

    render(
      <PortalTable
        columns={columns}
        data={rows}
        pagination={{ page: 1, pageSize: 1, totalItems: 2 }}
        onPaginationChange={onPaginationChange}
        getRowId={(row) => row.id}
      />,
    );

    await user.click(
      screen.getAllByRole("button", { name: "Row actions" })[0]!,
    );
    expect(screen.getByText("Inspect Zebib")).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Inspect Zebib" }));

    await user.click(screen.getByText("Next").closest("button")!);
    expect(onPaginationChange).toHaveBeenCalledWith({
      page: 2,
      pageSize: 1,
      totalItems: 2,
    });
  });
});
