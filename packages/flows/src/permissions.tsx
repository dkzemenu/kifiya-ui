"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/** One permission name, or several (see `PermissionMode`). */
export type PermissionRequirement = string | readonly string[];

/** `any`: one of the listed permissions is enough. `all`: every one is needed. */
export type PermissionMode = "any" | "all";

type PermissionsState = {
  /** `undefined` while loading. An empty set denies everything. */
  permissions: ReadonlySet<string> | undefined;
};

const PermissionsContext = createContext<PermissionsState | null>(null);

export interface PermissionsProviderProps {
  /**
   * The signed-in user's effective permissions, from the app's identity
   * service. Pass `undefined` while they load. The kit never decodes tokens
   * or calls an identity service itself (PRODUCT.md R-90).
   */
  permissions: readonly string[] | undefined;
  children: ReactNode;
}

export function PermissionsProvider({
  permissions,
  children,
}: PermissionsProviderProps) {
  const value = useMemo<PermissionsState>(
    () => ({ permissions: permissions ? new Set(permissions) : undefined }),
    [permissions],
  );
  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export type Access = "loading" | "allowed" | "denied";

/** Pure check: permission-based only; an empty set denies everything. */
export function checkAccess(
  permissions: ReadonlySet<string> | undefined,
  required: PermissionRequirement | undefined,
  mode: PermissionMode = "any",
): Access {
  if (required === undefined) return "allowed";
  if (permissions === undefined) return "loading";
  const list = typeof required === "string" ? [required] : required;
  if (list.length === 0) return "allowed";
  const ok =
    mode === "all"
      ? list.every((p) => permissions.has(p))
      : list.some((p) => permissions.has(p));
  return ok ? "allowed" : "denied";
}

function usePermissionsState(): PermissionsState {
  const state = useContext(PermissionsContext);
  if (!state) {
    throw new Error(
      "Permission checks need a <PermissionsProvider> above them.",
    );
  }
  return state;
}

/** The raw permission set (`undefined` while loading), for components that check many entries. */
export function usePermissionsSet(): ReadonlySet<string> | undefined {
  return usePermissionsState().permissions;
}

/**
 * `"loading"` until the app has supplied permissions, then `"allowed"` or
 * `"denied"`. A missing requirement is always allowed.
 */
export function useAccess(
  required: PermissionRequirement | undefined,
  mode: PermissionMode = "any",
): Access {
  const { permissions } = usePermissionsState();
  return checkAccess(permissions, required, mode);
}

/** `true` only once access is confirmed (`false` while loading). */
export function useCan(
  required: PermissionRequirement | undefined,
  mode: PermissionMode = "any",
): boolean {
  return useAccess(required, mode) === "allowed";
}

export interface PermissionGuardProps {
  require: PermissionRequirement | undefined;
  mode?: PermissionMode;
  /** Shown when access is denied, e.g. `<PortalPermissionDenied />`. Defaults to nothing. */
  denied?: ReactNode;
  /** Shown while permissions load. Defaults to nothing (D-010). */
  loading?: ReactNode;
  children: ReactNode;
}

/**
 * Renders `children` only once the user is confirmed to hold `require`.
 * While permissions load it renders `loading`, never the children, so a user
 * never briefly sees something they cannot use (D-010).
 */
export function PermissionGuard({
  require,
  mode = "any",
  denied = null,
  loading = null,
  children,
}: PermissionGuardProps) {
  const access = useAccess(require, mode);
  if (access === "loading") return <>{loading}</>;
  if (access === "denied") return <>{denied}</>;
  return <>{children}</>;
}
