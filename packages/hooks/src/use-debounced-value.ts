"use client";

import { useEffect, useState } from "react";

export const DEFAULT_SEARCH_DEBOUNCE_MS = 350;

/** Returns `value` after it has been stable for `delayMs`. */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = DEFAULT_SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
