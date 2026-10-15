import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Building2, LayoutDashboard, Settings, Users } from "lucide-react";
import { useState } from "react";

import {
  AppShell,
  ChangePasswordForm,
  FilterableListPage,
  NavRouteGuard,
  PermissionGuard,
  PermissionsProvider,
  SignInForm,
  type AppNavigation,
  type ListQuery,
} from "../src";

const navigation: AppNavigation = {
  main: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Agents", href: "/agents", icon: Users, permission: "agent:view" },
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
      permission: "access-management:manage",
    },
  ],
};

function Shell({
  permissions,
  pathname = "/dashboard",
}: {
  permissions: string[] | undefined;
  pathname?: string;
}) {
  return (
    <PermissionsProvider permissions={permissions}>
      <AppShell
        brand={<b>Kifiya</b>}
        navigation={navigation}
        pathname={pathname}
      >
        <NavRouteGuard
          navigation={navigation}
          pathname={pathname}
          denied={<p>No access to this page</p>}
          loading={<p>Checking access…</p>}
        >
          <p>Page content</p>
        </NavRouteGuard>
      </AppShell>
    </PermissionsProvider>
  );
}

function mainNav() {
  return screen.getAllByRole("navigation", { name: "Main navigation" })[0]!;
}

describe("R-03 flows", () => {
  it("AC-03.1 a guard whose permission set lacks the requirement shows its denied state, not its children", () => {
    render(
      <PermissionsProvider permissions={["agent:view"]}>
        <PermissionGuard require="union:view" denied={<p>Denied</p>}>
          <p>Secret</p>
        </PermissionGuard>
      </PermissionsProvider>,
    );
    expect(screen.getByText("Denied")).toBeInTheDocument();
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("AC-03.2 while permissions load, a guard shows its loading state, neither children nor denied", () => {
    render(
      <PermissionsProvider permissions={undefined}>
        <PermissionGuard
          require="union:view"
          denied={<p>Denied</p>}
          loading={<p>Loading</p>}
        >
          <p>Secret</p>
        </PermissionGuard>
      </PermissionsProvider>,
    );
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    expect(screen.queryByText("Denied")).not.toBeInTheDocument();
  });

  it("AC-03.2 the sidebar shows placeholders, not entries, while permissions load", () => {
    render(<Shell permissions={undefined} pathname="/agents" />);
    expect(within(mainNav()).queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("Checking access…")).toBeInTheDocument();
  });

  it("AC-03.3 an empty permission set denies every guarded entry and page; nothing falls back to roles", () => {
    render(<Shell permissions={[]} pathname="/unions" />);
    const links = within(mainNav())
      .getAllByRole("link")
      .map((a) => a.textContent);
    expect(links).toEqual(["Dashboard"]);
    expect(screen.getByText("No access to this page")).toBeInTheDocument();
    expect(screen.queryByText("Page content")).not.toBeInTheDocument();
    // The footer section (Settings only) disappears with its divider.
    const sidebar = mainNav().closest("aside")!;
    expect(sidebar.querySelector(".border-t")).toBeNull();
  });

  it("AC-03.4 one declaration decides both the navigation entry and its page guard", () => {
    const { unmount } = render(
      <Shell permissions={["agent:view"]} pathname="/agents/123" />,
    );
    expect(
      within(mainNav()).getByRole("link", { name: "Agents" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(mainNav()).queryByRole("link", { name: "Unions" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
    unmount();

    render(<Shell permissions={["agent:view"]} pathname="/unions" />);
    expect(screen.getByText("No access to this page")).toBeInTheDocument();
  });

  it("AC-03.5 collapsing keeps every label for screen readers and as a tooltip; narrow screens get a menu button", async () => {
    const user = userEvent.setup();
    render(
      <Shell
        permissions={["agent:view", "union:view", "access-management:manage"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    for (const name of ["Dashboard", "Agents", "Unions", "Settings"]) {
      const link = screen
        .getAllByRole("link", { name })
        .find((a) => a.closest("[data-collapsed]"))!;
      expect(link).toHaveAttribute("title", name);
    }
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("AC-03.6 blank fields are reported under each field and the submit handler is not called", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SignInForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.getByText("Enter your email or phone number."),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email or phone number")).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("AC-03.7 a failed sign-in shows the app's message and keeps the identifier", async () => {
    const user = userEvent.setup();
    render(
      <SignInForm
        onSubmit={async () => {
          throw Object.assign(new Error("Keycloak: invalid_grant"), {
            status: 401,
          });
        }}
        errorMessage={(error) =>
          (error as { status?: number }).status === 401
            ? "Wrong email or password."
            : undefined
        }
      />,
    );

    await user.type(
      screen.getByLabelText("Email or phone number"),
      "user@example.com",
    );
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Wrong email or password.",
    );
    expect(screen.queryByText(/Keycloak/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email or phone number")).toHaveValue(
      "user@example.com",
    );
  });

  describe("AC-03.8 the change-password form refuses a password that fails the app's rules or its confirmation", () => {
    // agent-frontend's union-portal rule, as an example of an app's rules (D-011).
    const validatePassword = (p: string) =>
      p.length < 8
        ? "Use at least 8 characters."
        : /\d/.test(p)
          ? null
          : "Include a number.";

    it("shows the app's reason and does not submit", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ChangePasswordForm
          validatePassword={validatePassword}
          onSubmit={onSubmit}
        />,
      );

      await user.type(screen.getByLabelText("New password"), "longbutnodigits");
      await user.type(
        screen.getByLabelText("Confirm new password"),
        "longbutnodigits",
      );
      await user.click(screen.getByRole("button", { name: "Save password" }));

      expect(screen.getByText("Include a number.")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("refuses a confirmation that does not match, and submits once both are right", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <ChangePasswordForm
          validatePassword={validatePassword}
          onSubmit={onSubmit}
        />,
      );

      await user.type(screen.getByLabelText("New password"), "secret123");
      await user.type(
        screen.getByLabelText("Confirm new password"),
        "secret124",
      );
      await user.click(screen.getByRole("button", { name: "Save password" }));
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();

      await user.clear(screen.getByLabelText("Confirm new password"));
      await user.type(
        screen.getByLabelText("Confirm new password"),
        "secret123",
      );
      await user.click(screen.getByRole("button", { name: "Save password" }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("secret123"));
    });
  });

  describe("filterable list page", () => {
    type Row = { id: string; name: string };
    const columns = [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        type: "text" as const,
      },
    ];

    function ListHarness({
      onQueryChange,
    }: {
      onQueryChange: (q: ListQuery) => void;
    }) {
      const [status, setStatus] = useState("ALL");
      return (
        <FilterableListPage<Row>
          title="Agents"
          tableTitle="All agents"
          searchPlaceholder="Search agents"
          filters={
            <button onClick={() => setStatus("ACTIVE")}>Only active</button>
          }
          filterKey={status}
          onQueryChange={onQueryChange}
          columns={columns}
          rows={[{ id: "a1", name: "Sample Agent" }]}
          totalItems={95}
          getRowId={(r) => r.id}
          debounceMs={300}
        />
      );
    }

    it("AC-03.9 asks for page 1 with the new term once typing pauses, not once per keystroke", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({
        delay: 50,
        advanceTimers: vi.advanceTimersByTime,
      });
      const onQueryChange = vi.fn();
      render(<ListHarness onQueryChange={onQueryChange} />);
      expect(onQueryChange).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 20,
        search: "",
      });
      onQueryChange.mockClear();

      // 50 ms between keystrokes (set on `user`): well under the 300 ms pause.
      await user.type(screen.getByPlaceholderText("Search agents"), "abebe");
      expect(onQueryChange).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(400));
      expect(onQueryChange).toHaveBeenCalledTimes(1);
      expect(onQueryChange).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        search: "abebe",
      });
    });

    it("AC-03.10 returns to page 1 when the search or a filter changes", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onQueryChange = vi.fn();
      render(<ListHarness onQueryChange={onQueryChange} />);

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /next/i }));
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 3 }),
      );

      await user.click(screen.getByRole("button", { name: "Only active" }));
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1 }),
      );

      await user.click(screen.getByRole("button", { name: /next/i }));
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 }),
      );
      await user.type(screen.getByPlaceholderText("Search agents"), "x");
      await act(() => vi.advanceTimersByTimeAsync(400));
      expect(onQueryChange).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 20,
        search: "x",
      });
    });
  });

  it("the flows make no network calls and read no tokens (R-90)", () => {
    const src = join(import.meta.dirname, "..", "src");
    const files = readdirSync(src).flatMap((f) =>
      statSync(join(src, f)).isFile() ? [join(src, f)] : [],
    );
    for (const file of files) {
      const code = readFileSync(file, "utf8");
      expect(code, file).not.toMatch(
        /\bfetch\(|XMLHttpRequest|axios|localStorage\.getItem\(["'][^"']*token|document\.cookie|jwt|atob\(/i,
      );
    }
  });
});
