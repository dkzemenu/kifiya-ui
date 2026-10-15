import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { useApiMutation } from "../src/query";

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@kifiya/ui", () => ({ toast }));

function wrapper(queryClient = new QueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  toast.success.mockClear();
  toast.error.mockClear();
});

describe("useApiMutation", () => {
  it("invalidates the given query keys, toasts success and calls onSuccess", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useApiMutation<string, string>({
          mutationFn: async (name) => `hello ${name}`,
          invalidates: [["a"], ["b", "c"]],
          successMessage: (data) => `Saved: ${data}`,
          onSuccess,
        }),
      { wrapper: wrapper(queryClient) },
    );

    act(() => result.current.mutate("world"));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith("hello world", "world"),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["a"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["b", "c"] });
    expect(toast.success).toHaveBeenCalledWith("Saved: hello world");
  });

  describe("AC-03.11 a failed mutation never shows the raw error text", () => {
    it("shows the message the app maps the error to", async () => {
      const onErrorMessage = vi.fn();
      const { result } = renderHook(
        () =>
          useApiMutation<void>({
            mutationFn: async () => {
              throw Object.assign(
                new Error("ORA-00942: table or view does not exist"),
                {
                  status: 409,
                },
              );
            },
            errorMessage: (error) =>
              (error as { status?: number }).status === 409
                ? "This record was changed by someone else."
                : undefined,
            onErrorMessage,
          }),
        { wrapper: wrapper() },
      );

      act(() => result.current.mutate());

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          "This record was changed by someone else.",
        ),
      );
      expect(onErrorMessage).toHaveBeenCalledWith(
        "This record was changed by someone else.",
        undefined,
      );
    });

    it("falls back to the app's fallback, not the error's message", async () => {
      const { result } = renderHook(
        () =>
          useApiMutation<{ editId: string | null }>({
            mutationFn: async () => {
              throw new Error("NullPointerException at UnionService.java:212");
            },
            errorFallback: ({ editId }) =>
              editId ? "Unable to update." : "Unable to create.",
          }),
        { wrapper: wrapper() },
      );

      act(() => result.current.mutate({ editId: "x" }));

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith("Unable to update."),
      );
      expect(toast.error).not.toHaveBeenCalledWith(
        expect.stringContaining("NullPointer"),
      );
    });

    it("has a generic default when the app sets no fallback", async () => {
      const { result } = renderHook(
        () =>
          useApiMutation<void>({
            mutationFn: async () => {
              throw new Error("internal detail");
            },
          }),
        { wrapper: wrapper() },
      );

      act(() => result.current.mutate());

      await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
      expect(toast.error.mock.calls[0]![0]).not.toContain("internal detail");
    });
  });
});

it("the main entry does not import React Query", async () => {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const src = join(import.meta.dirname, "..", "src");
  for (const file of [
    "index.ts",
    "use-debounced-value.ts",
    "use-pagination-state.ts",
    "use-drawer-state.ts",
  ]) {
    expect(readFileSync(join(src, file), "utf8")).not.toContain(
      "@tanstack/react-query",
    );
  }
});
