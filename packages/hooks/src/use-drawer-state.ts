"use client";

import { useCallback, useState } from "react";

/**
 * Open/close state for a drawer or dialog tied to an optional subject row
 * (`null` = create mode). Collapses the repeated
 * `const [open, setOpen] = useState(false); const [draft, setDraft] = ...`
 * pairs across the CRUD tables.
 */
export function useDrawerState<T>() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState<T | null>(null);

  const openWith = useCallback((next: T | null) => {
    setSubject(next);
    setOpen(true);
  }, []);

  const onOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubject(null);
    }
  }, []);

  return { open, subject, openWith, onOpenChange };
}
