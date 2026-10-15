"use client";

import {
  AppShell,
  AuthLayout,
  ChangePasswordForm,
  FilterableListPage,
  NavRouteGuard,
  PermissionGuard,
  PermissionsProvider,
  SignInForm,
  type AppNavigation,
  type ListQuery,
} from "@kifiya/flows";
import {
  KifiyaUIProvider,
  PortalButton,
  PortalFilterSelect,
  PortalPermissionDenied,
  PortalStatusChip,
  type KifiyaLinkProps,
  type PortalTableColumn,
} from "@kifiya/ui";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

// Synthetic records only (PRODUCT.md R-91).
type Agent = {
  id: string;
  name: string;
  region: string;
  status: "Active" | "Pending";
};
const agents: Agent[] = Array.from({ length: 64 }, (_, i) => ({
  id: `agent-${i + 1}`,
  name: `Sample Agent ${i + 1}`,
  region: ["Region A", "Region B", "Region C"][i % 3]!,
  status: i % 4 === 0 ? "Pending" : "Active",
}));

const navigation: AppNavigation = {
  main: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "Agents",
      href: "/agents",
      icon: Users,
      permission: "agent:view",
      badgeCount: 3,
    },
    {
      label: "Unions",
      href: "/unions",
      icon: Building2,
      permission: "union:view",
    },
  ],
  footer: [
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      permission: "settings:manage",
    },
  ],
};

type PermissionMode = "loading" | "none" | "agents" | "all";
const permissionSets: Record<PermissionMode, string[] | undefined> = {
  loading: undefined,
  none: [],
  agents: ["agent:view"],
  all: ["agent:view", "union:view", "settings:manage"],
};

function PermissionSwitch({
  mode,
  onChange,
}: {
  mode: PermissionMode;
  onChange: (mode: PermissionMode) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-text-subtle">Permissions:</span>
      {(Object.keys(permissionSets) as PermissionMode[]).map((m) => (
        <PortalButton
          key={m}
          size="sm"
          variant={mode === m ? "primary" : "outline"}
          onClick={() => onChange(m)}
        >
          {m === "loading"
            ? "Still loading"
            : m === "none"
              ? "None"
              : m === "agents"
                ? "agent:view"
                : "All"}
        </PortalButton>
      ))}
    </div>
  );
}

/** `PermissionGuard`: loading, denied and allowed states. */
export function Guard() {
  const [mode, setMode] = useState<PermissionMode>("agents");
  return (
    <div>
      <PermissionSwitch mode={mode} onChange={setMode} />
      <PermissionsProvider permissions={permissionSets[mode]}>
        <PermissionGuard
          require="union:view"
          loading={<p className="text-sm text-text-muted">Checking access…</p>}
          denied={<PortalPermissionDenied resourceLabel="unions" />}
        >
          <PortalStatusChip label="You can see unions" tone="success" />
        </PermissionGuard>
      </PermissionsProvider>
    </div>
  );
}

/**
 * The full app shell; its left column is also exported as `AppSidebar`. Click the sidebar entries: an in-page router stands in
 * for the app's own, and `NavRouteGuard` guards each page with its entry's
 * permission.
 */
export function Shell() {
  const [mode, setMode] = useState<PermissionMode>("agents");
  const [pathname, setPathname] = useState("/dashboard");

  function DemoLink({ href, onClick, ...props }: KifiyaLinkProps) {
    return (
      <a
        {...props}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          onClick?.(event);
          setPathname(href);
        }}
      />
    );
  }

  return (
    <div>
      <PermissionSwitch mode={mode} onChange={setMode} />
      <KifiyaUIProvider linkComponent={DemoLink}>
        <PermissionsProvider permissions={permissionSets[mode]}>
          <AppShell
            className="h-[520px] w-full rounded-card border border-border-soft"
            brand={
              <span className="text-lg font-bold text-text-heading">
                Kifiya
              </span>
            }
            navigation={navigation}
            pathname={pathname}
            profile={{
              name: "Sample User",
              subtitle: "user@example.com",
              initials: "SU",
            }}
            profileActions={[
              {
                label: "Log out",
                icon: LogOut,
                onSelect: () => setPathname("/dashboard"),
              },
            ]}
          >
            <NavRouteGuard
              navigation={navigation}
              pathname={pathname}
              loading={
                <p className="text-sm text-text-muted">Checking access…</p>
              }
              denied={<PortalPermissionDenied />}
            >
              <div className="k-card border p-6">
                <h2 className="k-title">{pathname}</h2>
                <p className="k-subtitle mt-1">Page content for {pathname}.</p>
              </div>
            </NavRouteGuard>
          </AppShell>
        </PermissionsProvider>
      </KifiyaUIProvider>
    </div>
  );
}

/** Try any email with the password `demo1234`; anything else shows the app's error message. */
export function SignIn() {
  const [signedIn, setSignedIn] = useState<string | null>(null);
  if (signedIn) {
    return (
      <div className="space-y-3">
        <PortalStatusChip label={`Signed in as ${signedIn}`} tone="success" />
        <PortalButton
          size="sm"
          variant="outline"
          onClick={() => setSignedIn(null)}
        >
          Sign out
        </PortalButton>
      </div>
    );
  }
  return (
    <SignInForm
      onSubmit={async ({ identifier, password }) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (password !== "demo1234")
          throw Object.assign(new Error("invalid_grant"), { status: 401 });
        setSignedIn(identifier);
      }}
      errorMessage={(error) =>
        (error as { status?: number }).status === 401
          ? "Wrong email or password."
          : undefined
      }
      footer={
        <a className="text-brand-primary hover:underline" href="#">
          Forgot password?
        </a>
      }
    />
  );
}

/** The app supplies the rules (D-011); this example uses 8+ characters with a number. */
export function ChangePassword() {
  const [done, setDone] = useState(false);
  if (done) return <PortalStatusChip label="Password changed" tone="success" />;
  return (
    <ChangePasswordForm
      validatePassword={(p) =>
        p.length < 8
          ? "Use at least 8 characters."
          : /\d/.test(p)
            ? null
            : "Include a number."
      }
      onSubmit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setDone(true);
      }}
    />
  );
}

/** `AuthLayout` frames a sign-in card, with an optional panel beside it on wide screens. */
export function Layout() {
  return (
    <AuthLayout
      className="min-h-0 rounded-card py-10"
      aside={
        <div className="k-panel p-8">
          <h2 className="k-title">Agent Network Portal</h2>
          <p className="k-subtitle mt-2">
            Sample marketing panel beside the form.
          </p>
        </div>
      }
    >
      <SignInForm onSubmit={async () => {}} />
    </AuthLayout>
  );
}

/** A server-paged list: here the "server" is a filter over synthetic rows. */
export function ListPage() {
  const [query, setQuery] = useState<ListQuery>({
    page: 1,
    pageSize: 20,
    search: "",
  });
  const [status, setStatus] = useState("ALL");

  const matching = useMemo(
    () =>
      agents.filter(
        (a) =>
          (status === "ALL" || a.status.toUpperCase() === status) &&
          a.name.toLowerCase().includes(query.search.toLowerCase()),
      ),
    [query.search, status],
  );
  const start = (query.page - 1) * query.pageSize;

  const columns: PortalTableColumn<Agent>[] = [
    { id: "name", header: "Agent", accessorKey: "name", type: "text" },
    { id: "region", header: "Region", accessorKey: "region", type: "text" },
    {
      id: "status",
      header: "Status",
      type: "chip",
      getChip: (row) => ({
        label: row.status,
        tone: row.status === "Active" ? "success" : "warning",
      }),
    },
  ];

  return (
    <FilterableListPage<Agent>
      title="Agents"
      subtitle={`Last query: page ${query.page}, size ${query.pageSize}, search "${query.search}"`}
      tableTitle="All agents"
      searchPlaceholder="Search agents"
      filters={
        <PortalFilterSelect
          placeholder="Status"
          value={status}
          onValueChange={setStatus}
          options={[
            { label: "All statuses", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Pending", value: "PENDING" },
          ]}
        />
      }
      filterKey={status}
      onQueryChange={setQuery}
      columns={columns}
      rows={matching.slice(start, start + query.pageSize)}
      totalItems={matching.length}
      getRowId={(row) => row.id}
    />
  );
}
