"use client";

import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  PortalButton,
  PortalTable,
  PortalTableCard,
  PortalTablePagination,
  PortalTablePlaceholder,
  PortalTableRowActions,
  type PortalTableColumn,
  type PortalTablePaginationState,
} from "@kifiya/ui";

type Agent = {
  id: string;
  name: string;
  code: string;
  region: string;
  status: "Active" | "Pending" | "Suspended";
  createdAt: string;
};

// Synthetic records only (PRODUCT.md R-91).
const allAgents: Agent[] = Array.from({ length: 45 }, (_, i) => ({
  id: `agent-${i + 1}`,
  name: `Sample Agent ${i + 1}`,
  code: `AG-${String(1000 + i)}`,
  region: ["Region A", "Region B", "Region C"][i % 3]!,
  status: (["Active", "Pending", "Suspended"] as const)[i % 3]!,
  createdAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
}));

const tones = {
  Active: "success",
  Pending: "warning",
  Suspended: "danger",
} as const;

const columns: PortalTableColumn<Agent>[] = [
  {
    id: "agent",
    header: "Agent",
    type: "avatar",
    sortable: true,
    getAvatar: (row) => ({
      name: row.name,
      subtitle: row.code,
      initials: `SA`,
    }),
  },
  { id: "region", header: "Region", accessorKey: "region", type: "text" },
  {
    id: "status",
    header: "Status",
    type: "chip",
    getChip: (row) => ({ label: row.status, tone: tones[row.status] }),
  },
  {
    id: "createdAt",
    header: "Created",
    accessorKey: "createdAt",
    type: "date",
  },
  {
    id: "actions",
    header: "",
    type: "actions",
    actions: [
      { label: "View", icon: Eye, onClick: () => {} },
      { label: "Delete", icon: Trash2, tone: "danger", onClick: () => {} },
    ],
  },
];

/** The app fetches one page and passes it in; the table never pages a full list. */
export function ServerPaged() {
  const [pagination, setPagination] = useState<PortalTablePaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: allAgents.length,
    pageSizeOptions: [10, 20, 50],
  });
  const start = (pagination.page - 1) * pagination.pageSize;
  const page = allAgents.slice(start, start + pagination.pageSize);
  return (
    <PortalTable
      columns={columns}
      data={page}
      getRowId={(row) => row.id}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}

export function Loading() {
  return <PortalTable columns={columns} data={[]} isLoading />;
}

export function ErrorState() {
  return (
    <PortalTable
      columns={columns}
      data={[]}
      error="Agents could not be loaded. Try again."
    />
  );
}

export function Empty() {
  return (
    <PortalTable columns={columns} data={[]} placeholder="No agents yet" />
  );
}

export function Card() {
  return (
    <PortalTableCard
      title="Recent agents"
      description="Sample table card."
      headerAction={<PortalButton size="sm">Export</PortalButton>}
      columns={columns}
      data={allAgents.slice(0, 5)}
      getRowId={(row) => row.id}
    />
  );
}

export function Pagination() {
  const [pagination, setPagination] = useState<PortalTablePaginationState>({
    page: 2,
    pageSize: 20,
    totalItems: 230,
    pageSizeOptions: [10, 20, 50],
  });
  return (
    <PortalTablePagination
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}

export function Placeholder() {
  return (
    <div className="space-y-4">
      <PortalTablePlaceholder placeholder="No records found" />
      <PortalTablePlaceholder
        placeholder="Could not load records"
        tone="error"
      />
    </div>
  );
}

/**
 * Row actions on their own. Inside a table they come from an `actions` column;
 * `PortalTableRowRenderer` renders each row and is used by `PortalTable`.
 */
export function RowActions() {
  return (
    <PortalTableRowActions
      row={allAgents[0]!}
      actions={[
        { label: "View", icon: Eye, onClick: () => {} },
        { label: "Delete", icon: Trash2, tone: "danger", onClick: () => {} },
      ]}
    />
  );
}
