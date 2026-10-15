import { act, renderHook } from "@testing-library/react";

import { useDrawerState, usePaginationState } from "../src";

describe("usePaginationState", () => {
  it("starts on page 1 with the given page size and applies table changes", () => {
    const { result } = renderHook(() => usePaginationState(50));
    expect(result.current).toMatchObject({ page: 1, pageSize: 50 });

    act(() => result.current.onPaginationChange({ page: 3, pageSize: 20 }));
    expect(result.current).toMatchObject({ page: 3, pageSize: 20 });

    act(() => result.current.resetPage());
    expect(result.current).toMatchObject({ page: 1, pageSize: 20 });
  });
});

describe("useDrawerState", () => {
  it("opens with a subject and clears it on close", () => {
    const { result } = renderHook(() => useDrawerState<{ id: string }>());
    expect(result.current).toMatchObject({ open: false, subject: null });

    act(() => result.current.openWith({ id: "a1" }));
    expect(result.current).toMatchObject({ open: true, subject: { id: "a1" } });

    act(() => result.current.onOpenChange(false));
    expect(result.current).toMatchObject({ open: false, subject: null });
  });

  it("opens in create mode with a null subject", () => {
    const { result } = renderHook(() => useDrawerState<{ id: string }>());
    act(() => result.current.openWith(null));
    expect(result.current).toMatchObject({ open: true, subject: null });
  });
});
