"use client";

import {
  useDebouncedValue,
  useDrawerState,
  usePaginationState,
} from "@kifiya/hooks";
import { useApiMutation } from "@kifiya/hooks/query";
import {
  Input,
  PortalButton,
  PortalDrawer,
  PortalTablePagination,
} from "@kifiya/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/** The value settles 350 ms after you stop typing (the default delay). */
export function DebouncedValue() {
  const [text, setText] = useState("");
  const debounced = useDebouncedValue(text);
  return (
    <div className="grid max-w-sm gap-2 text-sm">
      <Input
        placeholder="Type quickly…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p>
        Typed: <code>{text}</code>
      </p>
      <p>
        Debounced: <code>{debounced}</code>
      </p>
    </div>
  );
}

/** 1-based page state in the shape `PortalTable` uses; `resetPage` for new filters. */
export function PaginationState() {
  const { page, pageSize, onPaginationChange, resetPage } =
    usePaginationState(10);
  return (
    <div className="space-y-3 text-sm">
      <p>
        Page {page}, {pageSize} per page.{" "}
        <PortalButton size="sm" variant="outline" onClick={resetPage}>
          Reset to page 1
        </PortalButton>
      </p>
      <PortalTablePagination
        pagination={{
          page,
          pageSize,
          totalItems: 230,
          pageSizeOptions: [10, 20, 50],
        }}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
}

/** One drawer for create (`openWith(null)`) and edit (`openWith(row)`). */
export function DrawerState() {
  const drawer = useDrawerState<{ id: string; name: string }>();
  return (
    <div className="flex gap-2">
      <PortalButton onClick={() => drawer.openWith(null)}>Create</PortalButton>
      <PortalButton
        variant="outline"
        onClick={() => drawer.openWith({ id: "p1", name: "Sample profile" })}
      >
        Edit sample
      </PortalButton>
      <PortalDrawer
        open={drawer.open}
        onOpenChange={drawer.onOpenChange}
        title={
          drawer.subject ? `Edit ${drawer.subject.name}` : "Create profile"
        }
      >
        <div className="p-6 text-sm">
          Subject: {drawer.subject ? drawer.subject.id : "none (create)"}
        </div>
      </PortalDrawer>
    </div>
  );
}

const queryClient = new QueryClient();

function SaveButton({ fail }: { fail: boolean }) {
  const save = useApiMutation<void>({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (fail) {
        throw Object.assign(new Error("ConstraintViolation: uk_profile_name"), {
          status: 409,
        });
      }
    },
    invalidates: [["profiles"]],
    successMessage: "Profile saved",
    errorMessage: (error) =>
      (error as { status?: number }).status === 409
        ? "A profile with this name already exists."
        : undefined,
    errorFallback: "The profile could not be saved.",
  });
  return (
    <PortalButton
      variant={fail ? "outline" : "primary"}
      loading={save.isPending}
      onClick={() => save.mutate()}
    >
      {fail ? "Save (fails)" : "Save"}
    </PortalButton>
  );
}

/**
 * `@kifiya/hooks/query`: needs the app's `QueryClientProvider` and a mounted
 * `<Toaster />`. The failing save shows the app's message, never the raw error.
 */
export function ApiMutation() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex gap-2">
        <SaveButton fail={false} />
        <SaveButton fail />
      </div>
    </QueryClientProvider>
  );
}
