"use client";

import { toast } from "@kifiya/ui";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useRef } from "react";

export interface UseApiMutationOptions<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys invalidated after a successful mutation. */
  invalidates?: QueryKey[];
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Toasted on success when set. */
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  /**
   * Maps a failure to the message the user sees, e.g. by HTTP status.
   * Return `undefined` to use `errorFallback`. The error's own text is never
   * shown: it may be a backend's internal message (D-012).
   */
  errorMessage?: (error: unknown, variables: TVariables) => string | undefined;
  /** Shown when `errorMessage` is absent or returns nothing. */
  errorFallback?: string | ((variables: TVariables) => string);
  /** Called with the message the user was shown. */
  onErrorMessage?: (message: string, variables: TVariables) => void;
}

/**
 * React Query `useMutation` in the portal's standard shape: invalidate a fixed
 * set of query keys on success, toast a success or error message, and keep
 * the latest callbacks without re-creating the mutation.
 *
 * Needs a `QueryClientProvider` from the app (`@tanstack/react-query` is a
 * peer dependency) and a mounted `<Toaster />` from `@kifiya/ui`.
 */
export function useApiMutation<TVariables, TData = unknown>(
  options: UseApiMutationOptions<TVariables, TData>,
) {
  const queryClient = useQueryClient();
  const onSuccessRef = useRef(options.onSuccess);
  const onErrorMessageRef = useRef(options.onErrorMessage);
  const errorMessageRef = useRef(options.errorMessage);
  onSuccessRef.current = options.onSuccess;
  onErrorMessageRef.current = options.onErrorMessage;
  errorMessageRef.current = options.errorMessage;

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: async (data, variables) => {
      if (options.invalidates?.length) {
        await Promise.all(
          options.invalidates.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
      if (options.successMessage) {
        toast.success(
          typeof options.successMessage === "function"
            ? options.successMessage(data, variables)
            : options.successMessage,
        );
      }
      onSuccessRef.current?.(data, variables);
    },
    onError: (error: unknown, variables) => {
      const fallback =
        typeof options.errorFallback === "function"
          ? options.errorFallback(variables)
          : (options.errorFallback ??
            "Something went wrong. Please try again.");
      const message = errorMessageRef.current?.(error, variables) ?? fallback;
      toast.error(message);
      onErrorMessageRef.current?.(message, variables);
    },
  });
}
