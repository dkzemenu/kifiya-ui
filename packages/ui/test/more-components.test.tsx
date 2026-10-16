import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import {
  Autocomplete,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Form,
  FormField,
  FormSubmit,
  Image,
  Input,
  KifiyaUIProvider,
  NavMenu,
  useForm,
  type KifiyaLinkProps,
} from "../src";
import { Chart } from "../src/chart";

type Agent = { id: string; name: string };

const AGENTS: Agent[] = [
  { id: "a1", name: "Agent One" },
  { id: "a2", name: "Agent Two" },
  { id: "a3", name: "Another Agent" },
];

function AutocompleteHarness({
  search,
  onChange,
}: {
  search: (query: string) => Promise<Agent[]>;
  onChange: (agent: Agent | null) => void;
}) {
  const [value, setValue] = useState<Agent | null>(null);
  return (
    <Autocomplete
      aria-label="Agent"
      value={value}
      onChange={(agent) => {
        setValue(agent);
        onChange(agent);
      }}
      search={search}
      getOptionKey={(agent) => agent.id}
      getOptionLabel={(agent) => agent.name}
      debounceMs={150}
    />
  );
}

describe("R-02 components (D-016)", () => {
  describe("AC-02.7 autocomplete", () => {
    it("asks the app once typing pauses, not once per keystroke", async () => {
      const user = userEvent.setup();
      const search = vi.fn(async (query: string) =>
        AGENTS.filter((a) => a.name.toLowerCase().includes(query)),
      );
      render(<AutocompleteHarness search={search} onChange={() => {}} />);

      await user.type(screen.getByRole("combobox", { name: "Agent" }), "agent");

      expect(await screen.findAllByRole("option")).toHaveLength(3);
      expect(search).toHaveBeenCalledTimes(1);
      expect(search).toHaveBeenCalledWith("agent");
    });

    it("chooses an option with the arrow keys and Enter, and clearing reports nothing selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <AutocompleteHarness search={async () => AGENTS} onChange={onChange} />,
      );
      const input = screen.getByRole("combobox", { name: "Agent" });

      await user.type(input, "a");
      await screen.findAllByRole("option");
      await user.keyboard("{ArrowDown}{Enter}");

      expect(onChange).toHaveBeenLastCalledWith(AGENTS[1]);
      expect(input).toHaveValue("Agent Two");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Clear" }));
      expect(onChange).toHaveBeenLastCalledWith(null);
      expect(input).toHaveValue("");
      expect(input).toHaveFocus();
    });

    it("never shows a failed search's own error text", async () => {
      const user = userEvent.setup();
      render(
        <AutocompleteHarness
          search={async () => {
            throw new Error("upstream 502 at 10.0.0.4");
          }}
          onChange={() => {}}
        />,
      );
      await user.type(screen.getByRole("combobox", { name: "Agent" }), "a");
      expect(
        await screen.findByText("Couldn't load results. Try again."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/10\.0\.0\.4/)).not.toBeInTheDocument();
    });
  });

  describe("AC-02.8 chart", () => {
    it("shows its empty state instead of blank axes when there are no rows", () => {
      render(
        <Chart
          type="bar"
          label="Transactions per day"
          data={[]}
          xKey="day"
          series={[{ key: "count", label: "Transactions" }]}
          emptyState="No transactions this week"
        />,
      );
      const chart = screen.getByRole("img", { name: "Transactions per day" });
      expect(chart).toHaveTextContent("No transactions this week");
      expect(chart.querySelector(".recharts-wrapper")).toBeNull();
    });

    it("gives screen readers a text label when it has rows", () => {
      render(
        <Chart
          type="donut"
          label="Agents by status"
          data={[
            { status: "Active", count: 12 },
            { status: "Pending", count: 3 },
          ]}
          valueKey="count"
          nameKey="status"
        />,
      );
      expect(
        screen.getByRole("img", { name: "Agents by status" }),
      ).toBeInTheDocument();
    });
  });

  describe("AC-02.9 an app without charts does not install the charting library", () => {
    const root = join(import.meta.dirname, "..");

    it("recharts is an optional peer, not a dependency", () => {
      const pkg = JSON.parse(
        readFileSync(join(root, "package.json"), "utf8"),
      ) as Record<string, Record<string, unknown>>;
      expect(pkg.dependencies).not.toHaveProperty("recharts");
      expect(pkg.peerDependencies).toHaveProperty("recharts");
      expect(pkg.peerDependenciesMeta?.recharts).toEqual({ optional: true });
      expect(pkg.exports).toHaveProperty("./chart");
    });

    it("only the chart entry imports recharts", () => {
      const files = (dir: string): string[] =>
        readdirSync(dir).flatMap((name) => {
          const path = join(dir, name);
          return statSync(path).isDirectory() ? files(path) : [path];
        });
      const importers = files(join(root, "src"))
        .filter((f) => /from "recharts"/.test(readFileSync(f, "utf8")))
        .map((f) => f.slice(root.length + 1));
      expect(importers).toEqual(["src/chart/index.tsx"]);
      expect(readFileSync(join(root, "src/index.ts"), "utf8")).not.toContain(
        "chart",
      );
    });
  });

  type SignUp = { name: string; phone: string };

  function SignUpForm({
    onSubmit,
    submitErrorMessage,
  }: {
    onSubmit: (values: SignUp) => Promise<void>;
    submitErrorMessage?: (error: unknown) => string | undefined;
  }) {
    const form = useForm<SignUp>({
      initialValues: { name: "", phone: "" },
      validate: {
        name: (value) => (value.trim() ? undefined : "Enter a name"),
        phone: (value) =>
          /^09\d{8}$/.test(value) ? undefined : "Enter a phone like 0912345678",
      },
      onSubmit,
      submitErrorMessage,
    });
    return (
      <Form form={form} aria-label="Sign up">
        <FormField name="name" label="Name">
          {(field) => <Input {...field.inputProps} />}
        </FormField>
        <FormField name="phone" label="Phone">
          {(field) => <Input {...field.inputProps} />}
        </FormField>
        <FormSubmit>Save</FormSubmit>
      </Form>
    );
  }

  describe("AC-02.10 form validation", () => {
    it("shows each problem under its field, focuses the first, and does not submit", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn(async () => {});
      render(<SignUpForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("Phone"), "123");
      await user.click(screen.getByRole("button", { name: "Save" }));

      const name = screen.getByLabelText("Name");
      const phone = screen.getByLabelText("Phone");
      expect(name).toHaveAccessibleDescription("Enter a name");
      expect(phone).toHaveAccessibleDescription(
        "Enter a phone like 0912345678",
      );
      expect(name).toHaveAttribute("aria-invalid", "true");
      await waitFor(() => expect(name).toHaveFocus());
      expect(onSubmit).not.toHaveBeenCalled();

      await user.type(name, "Abebe");
      expect(name).not.toHaveAttribute("aria-invalid");
      expect(screen.queryByText("Enter a name")).not.toBeInTheDocument();
    });
  });

  describe("AC-02.11 form submitting and failure", () => {
    it("disables the fields and submit button while submitting", async () => {
      const user = userEvent.setup();
      let finish: () => void = () => {};
      const onSubmit = vi.fn(
        () => new Promise<void>((resolve) => (finish = resolve)),
      );
      render(<SignUpForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("Name"), "Abebe");
      await user.type(screen.getByLabelText("Phone"), "0912345678");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(onSubmit).toHaveBeenCalledWith({
        name: "Abebe",
        phone: "0912345678",
      });
      expect(screen.getByLabelText("Name")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

      finish();
      await waitFor(() => expect(screen.getByLabelText("Name")).toBeEnabled());
    });

    it("shows the app's message, never the error's own text, and keeps what was typed", async () => {
      const user = userEvent.setup();
      render(
        <SignUpForm
          onSubmit={async () => {
            throw new Error("duplicate key value violates constraint");
          }}
          submitErrorMessage={() => "That phone number is already registered."}
        />,
      );
      await user.type(screen.getByLabelText("Name"), "Abebe");
      await user.type(screen.getByLabelText("Phone"), "0912345678");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "That phone number is already registered.",
      );
      expect(screen.queryByText(/duplicate key/)).not.toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toHaveValue("Abebe");
      expect(screen.getByLabelText("Phone")).toHaveValue("0912345678");
    });

    it("falls back to a generic message when the app maps nothing", async () => {
      const user = userEvent.setup();
      render(
        <SignUpForm
          onSubmit={async () => {
            throw new Error("internal");
          }}
        />,
      );
      await user.type(screen.getByLabelText("Name"), "Abebe");
      await user.type(screen.getByLabelText("Phone"), "0912345678");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Something went wrong. Please try again.",
      );
    });
  });

  it("AC-02.12 an image that fails to load shows its fallback", () => {
    render(
      <Image
        src="/missing.png"
        alt="Agent photo"
        fallback="No photo"
        aspectRatio={1}
      />,
    );
    fireEvent.error(screen.getByRole("img", { name: "Agent photo" }));

    const fallback = screen.getByRole("img", { name: "Agent photo" });
    expect(fallback.tagName).toBe("SPAN");
    expect(fallback).toHaveTextContent("No photo");
  });

  it("AC-02.13 the navigation menu marks the current entry, through the app's link", () => {
    const links: string[] = [];
    function AppLink(props: KifiyaLinkProps) {
      links.push(props.href);
      return <a data-app-link {...props} />;
    }
    render(
      <KifiyaUIProvider linkComponent={AppLink}>
        <NavMenu
          aria-label="Sections"
          currentPath="/agents/42"
          items={[
            { label: "Overview", href: "/" },
            { label: "Agents", href: "/agents" },
            { label: "Agent groups", href: "/agents-groups" },
          ]}
        />
      </KifiyaUIProvider>,
    );
    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agents" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    for (const name of ["Overview", "Agent groups"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute(
        "aria-current",
      );
    }
    expect(links).toEqual(["/", "/agents", "/agents-groups"]);
  });

  it("AC-02.5 dialog opens by keyboard, closes on Escape and returns focus", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Edit agent</DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit agent</DialogTitle>
          <DialogDescription>Change the agent's details.</DialogDescription>
          <input aria-label="Name" />
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Edit agent" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(
      await screen.findByRole("dialog", { name: "Edit agent" }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
