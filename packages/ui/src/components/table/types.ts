"use client";

import type { Row } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export type PortalCellType =
  | "text"
  | "custom"
  | "chip"
  | "multi_status"
  | "date"
  | "avatar"
  | "actions"
  | "selection";

export type PortalSortDirection = "asc" | "desc";

export interface PortalTableSortState {
  columnId: string;
  direction: PortalSortDirection;
}

export interface PortalTablePaginationState {
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
  pageSizeOptions?: number[];
  /** When set, overrides prev-button logic (Spring `first` flag). */
  first?: boolean;
  /** When set, overrides next-button logic (Spring `last` flag). */
  last?: boolean;
}

export interface PortalChipValue {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral" | "processing";
  className?: string;
}

export interface PortalAvatarValue {
  name: string;
  subtitle?: string;
  initials: string;
  avatarToneClassName?: string;
}

export interface PortalTableRowAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  tone?: "default" | "danger";
  disabled?: boolean;
  hidden?: boolean;
}

export interface PortalTableColumn<T> {
  id: string;
  header: ReactNode;
  accessorKey?: keyof T | string;
  type: PortalCellType;
  width?: CSSProperties["width"];
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  emptyValue?: string;
  cell?: (row: T) => ReactNode;
  getValue?: (row: T) => unknown;
  getChip?: (row: T) => PortalChipValue;
  getChips?: (row: T) => PortalChipValue[];
  getAvatar?: (row: T) => PortalAvatarValue;
  actions?: PortalTableRowAction<T>[] | ((row: T) => PortalTableRowAction<T>[]);
}

export interface PortalTableProps<T> {
  data: T[];
  columns: PortalTableColumn<T>[];
  isLoading?: boolean;
  /**
   * Set when the rows failed to load; shown in place of the body as an alert.
   * The app supplies the copy. Ignored while `isLoading`.
   */
  error?: ReactNode;
  placeholder?: string;
  selectedRowIds?: string[];
  onSelectionChange?: (selectedRows: T[]) => void;
  onRowClick?: (row: T) => void;
  activeRowId?: string;
  sort?: PortalTableSortState;
  onSortChange?: (sort: PortalTableSortState) => void;
  pagination?: PortalTablePaginationState;
  onPaginationChange?: (pagination: PortalTablePaginationState) => void;
  tableClassName?: string;
  rowClassName?: string | ((row: Row<T>) => string | undefined);
  getRowId?: (row: T, index: number) => string;
}

export interface PortalTableCardProps<T> extends PortalTableProps<T> {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  footerContent?: ReactNode;
}
