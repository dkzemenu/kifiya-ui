/** Starter files written by `init` and `add`. */

export function providersTemplate(usesNext: boolean): string {
  const link = usesNext ? 'import Link from "next/link";\n' : "";
  const linkProp = usesNext ? " linkComponent={Link}" : "";
  return `"use client";

import { KifiyaUIProvider, Toaster, TooltipProvider } from "@kifiya/ui";
${link}import type { ReactNode } from "react";

/** App-wide setup for the Kifiya UI kit. Wrap your root layout's children in it. */
export function KifiyaProviders({ children }: { children: ReactNode }) {
  return (
    <KifiyaUIProvider${linkProp}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </KifiyaUIProvider>
  );
}
`;
}

export const SCREENS = {
  "sign-in": {
    description: "Sign-in card with a change-password step",
    file: "sign-in-screen.tsx",
    source: `"use client";

import { AuthLayout, ChangePasswordForm, SignInForm } from "@kifiya/flows";
import { useState } from "react";

// TODO(app): replace with your identity service calls. The kit never calls a
// server or reads a token itself.
async function signIn(_identifier: string, _password: string): Promise<{ mustChangePassword: boolean }> {
  throw new Error("Not wired yet");
}
async function changePassword(_newPassword: string): Promise<void> {
  throw new Error("Not wired yet");
}

export function SignInScreen() {
  const [mustChange, setMustChange] = useState(false);
  return (
    <AuthLayout>
      {mustChange ? (
        <ChangePasswordForm
          // Your app's password rules (DECISIONS.md D-011 in kifiya-ui).
          validatePassword={(p) => (p.length < 8 ? "Use at least 8 characters." : null)}
          onSubmit={changePassword}
        />
      ) : (
        <SignInForm
          onSubmit={async ({ identifier, password }) => {
            const result = await signIn(identifier, password);
            if (result.mustChangePassword) setMustChange(true);
          }}
          // Map failures to safe copy; never show the server's own text.
          errorMessage={(error) =>
            (error as { status?: number }).status === 401 ? "Wrong email or password." : undefined
          }
        />
      )}
    </AuthLayout>
  );
}
`,
  },
  "app-shell": {
    description: "Permission-aware app shell with a guarded page area",
    file: "app-frame.tsx",
    source: `"use client";

import { AppShell, NavRouteGuard, PermissionsProvider, type AppNavigation } from "@kifiya/flows";
import { PortalPermissionDenied } from "@kifiya/ui";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import type { ReactNode } from "react";

// One declaration per entry: it decides both the menu item and its page guard.
const navigation: AppNavigation = {
  main: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  footer: [{ label: "Settings", href: "/settings", icon: Settings, permission: "settings:manage" }],
};

export function AppFrame({
  pathname,
  permissions,
  user,
  onSignOut,
  children,
}: {
  /** From your router, e.g. usePathname(). */
  pathname: string;
  /** From your identity service; undefined while loading. */
  permissions: string[] | undefined;
  user: { name: string; subtitle?: string; initials: string };
  onSignOut: () => void;
  children: ReactNode;
}) {
  return (
    <PermissionsProvider permissions={permissions}>
      <AppShell
        brand={<span className="text-lg font-bold">Your app</span>}
        navigation={navigation}
        pathname={pathname}
        profile={user}
        profileActions={[{ label: "Log out", icon: LogOut, onSelect: onSignOut }]}
        collapsedStorageKey="sidebar_collapsed"
      >
        <NavRouteGuard navigation={navigation} pathname={pathname} denied={<PortalPermissionDenied />}>
          {children}
        </NavRouteGuard>
      </AppShell>
    </PermissionsProvider>
  );
}
`,
  },
  "list-page": {
    description: "Server-paged list with search and a status filter",
    file: "records-list-page.tsx",
    source: `"use client";

import { FilterableListPage, type ListQuery } from "@kifiya/flows";
import { PortalFilterSelect, type PortalTableColumn } from "@kifiya/ui";
import { useEffect, useState } from "react";

type Row = { id: string; name: string; status: string };

const columns: PortalTableColumn<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name", type: "text" },
  { id: "status", header: "Status", accessorKey: "status", type: "text" },
];

// TODO(app): replace with your API call; return one page and the total count.
async function fetchPage(_query: ListQuery & { status: string }): Promise<{ rows: Row[]; total: number }> {
  return { rows: [], total: 0 };
}

export function RecordsListPage() {
  const [query, setQuery] = useState<ListQuery>({ page: 1, pageSize: 20, search: "" });
  const [status, setStatus] = useState("ALL");
  const [result, setResult] = useState<{ rows: Row[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPage({ ...query, status })
      .then((next) => !cancelled && (setResult(next), setError(undefined)))
      .catch(() => !cancelled && setError("Records could not be loaded."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, status]);

  return (
    <FilterableListPage<Row>
      title="Records"
      tableTitle="All records"
      searchPlaceholder="Search records"
      filters={
        <PortalFilterSelect
          placeholder="Status"
          value={status}
          onValueChange={setStatus}
          options={[{ label: "All statuses", value: "ALL" }]}
        />
      }
      filterKey={status}
      onQueryChange={setQuery}
      columns={columns}
      rows={result.rows}
      totalItems={result.total}
      getRowId={(row) => row.id}
      isLoading={loading}
      error={error}
    />
  );
}
`,
  },
} as const;

export type ScreenName = keyof typeof SCREENS;
