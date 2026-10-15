"use client";

import { useCallback, useMemo, useState } from "react";

export interface RowWithId {
  id: string;
}

export interface RowDetailController<T extends RowWithId> {
  selectedRow: T | null;
  selectedRowId: string | null;
  isOpen: boolean;
  openDetail: (row: T) => void;
  closeDetail: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useRowDetailController<
  T extends RowWithId,
>(): RowDetailController<T> {
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = useCallback((row: T) => {
    setSelectedRow(row);
    setIsOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsOpen(false);
    setSelectedRow(null);
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedRow(null);
    }
  }, []);

  return useMemo(
    () => ({
      selectedRow,
      selectedRowId: selectedRow?.id ?? null,
      isOpen,
      openDetail,
      closeDetail,
      onOpenChange,
    }),
    [closeDetail, isOpen, onOpenChange, openDetail, selectedRow],
  );
}
