import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import {
  Banner,
  CurrencyField,
  DateRangePicker,
  EmptyState,
  FileDropzone,
  Form,
  FormField,
  FormSubmit,
  Input,
  MultiSelect,
  OtpInput,
  Stepper,
  useForm,
  type DateRange,
} from "../src";

const REGIONS = [
  { value: "AA", label: "Addis Ababa" },
  { value: "OR", label: "Oromia" },
  { value: "AM", label: "Amhara" },
];

describe("R-02 components, 0.3 (D-021)", () => {
  it("AC-02.14 a multi-select reports every chosen option, shows each as a removable tag, and works by keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <MultiSelect
          aria-label="Regions"
          options={REGIONS}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: /Regions/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox");
    await user.click(
      within(listbox).getByRole("option", { name: "Addis Ababa" }),
    );
    await user.click(within(listbox).getByRole("option", { name: "Amhara" }));
    expect(onChange).toHaveBeenLastCalledWith(["AA", "AM"]);
    await user.keyboard("{Escape}");

    expect(trigger).toHaveTextContent("2 selected");
    const tags = screen.getByRole("grid", { name: "Regions, chosen" });
    expect(within(tags).getAllByRole("row")).toHaveLength(2);

    await user.click(
      screen.getByRole("button", { name: "Remove Addis Ababa" }),
    );
    expect(onChange).toHaveBeenLastCalledWith(["AM"]);
  });

  describe("AC-02.15 date range picker", () => {
    function Harness({
      onChange,
      calendar,
      value: initial = null,
    }: {
      onChange: (range: DateRange | null) => void;
      calendar?: "gregorian" | "ethiopic";
      value?: DateRange | null;
    }) {
      const [value, setValue] = useState<DateRange | null>(initial);
      return (
        <DateRangePicker
          aria-label="Period"
          locale="en-US"
          calendar={calendar}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }

    const segments = () => screen.getAllByRole("spinbutton");

    it("reports both dates once the range is complete", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      await user.click(segments()[0]!);
      await user.keyboard("03052026");
      await user.keyboard("03202026");
      await waitFor(() =>
        expect(onChange).toHaveBeenLastCalledWith({
          start: "2026-03-05",
          end: "2026-03-20",
        }),
      );
    });

    it("refuses an end before the start, with the reason shown", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      await user.click(segments()[0]!);
      await user.keyboard("03202026");
      await user.keyboard("03052026");
      expect(
        await screen.findByText("The end date can't be before the start date."),
      ).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalledWith(
        expect.objectContaining({ start: "2026-03-20" }),
      );
    });

    it("shows Ethiopian dates when asked, while the app keeps Gregorian values", () => {
      render(
        <Harness
          onChange={() => {}}
          calendar="ethiopic"
          value={{ start: "2026-09-11", end: "2026-09-20" }}
        />,
      );
      // 11 September 2026 is Meskerem 1, 2019 in the Ethiopian calendar.
      const years = segments().filter((s) =>
        /year/i.test(s.getAttribute("aria-label") ?? ""),
      );
      expect(years[0]).toHaveTextContent("2019");
      const months = segments().filter((s) =>
        /month/i.test(s.getAttribute("aria-label") ?? ""),
      );
      expect(months[0]).toHaveAttribute("aria-valuenow", "1");
    });
  });

  it("AC-02.16 a currency field reports whole minor units and shows the amount for the locale", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Harness() {
      const [amount, setAmount] = useState<number | null>(null);
      return (
        <CurrencyField
          aria-label="Limit"
          locale="en-US"
          currency="ETB"
          amountMinor={amount}
          onChange={(next) => {
            setAmount(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Limit" });
    await user.type(input, "1250.5");
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(125050);
    expect((input as HTMLInputElement).value).toMatch(/^ETB\s1,250\.50$/);
  });

  describe("AC-02.17 one-time-code input", () => {
    function Harness({ onComplete }: { onComplete: (code: string) => void }) {
      const [code, setCode] = useState("");
      return (
        <OtpInput
          aria-label="Verification code"
          length={6}
          value={code}
          onChange={setCode}
          onComplete={onComplete}
        />
      );
    }

    it("fills the next box as digits are typed, ignores anything else, and reports the full code", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Harness onComplete={onComplete} />);
      const boxes = within(
        screen.getByRole("group", { name: "Verification code" }),
      ).getAllByRole("textbox");
      await user.click(boxes[0]!);
      await user.keyboard("12a3");
      expect(boxes.map((b) => (b as HTMLInputElement).value)).toEqual([
        "1",
        "2",
        "3",
        "",
        "",
        "",
      ]);
      expect(boxes[3]).toHaveFocus();
      expect(onComplete).not.toHaveBeenCalled();
      await user.keyboard("456");
      expect(onComplete).toHaveBeenCalledWith("123456");
    });

    it("spreads a pasted code across the boxes", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Harness onComplete={onComplete} />);
      const boxes = screen.getAllByRole("textbox");
      await user.click(boxes[0]!);
      await user.paste("98-76 54");
      expect(onComplete).toHaveBeenCalledWith("987654");
    });
  });

  describe("AC-02.18 file drop zone", () => {
    function Harness({ onChange }: { onChange: (files: File[]) => void }) {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <FileDropzone
          label="MOU document"
          accept={["application/pdf", "image/png", "image/jpeg"]}
          maxSizeBytes={1024 * 1024}
          value={files}
          onChange={(next) => {
            setFiles(next);
            onChange(next);
          }}
        />
      );
    }
    const choose = (file: File) => {
      const input =
        document.querySelector<HTMLInputElement>('input[type="file"]')!;
      fireEvent.change(input, { target: { files: [file] } });
    };

    it("refuses a file of the wrong type or size, with the reason, and keeps nothing", () => {
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      choose(new File(["x"], "notes.docx", { type: "application/msword" }));
      expect(screen.getByRole("alert")).toHaveTextContent(
        "notes.docx isn't an accepted file type.",
      );
      choose(
        new File([new Uint8Array(2 * 1024 * 1024)], "scan.pdf", {
          type: "application/pdf",
        }),
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        "scan.pdf is larger than 1.0 MB.",
      );
      expect(onChange).not.toHaveBeenCalled();
    });

    it("keeps an accepted file, replaces it with a new one, and removes it", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      choose(new File(["x"], "mou.pdf", { type: "application/pdf" }));
      expect(screen.getByText("mou.pdf")).toBeInTheDocument();
      choose(new File(["y"], "mou-signed.png", { type: "image/png" }));
      expect(screen.queryByText("mou.pdf")).not.toBeInTheDocument();
      expect(screen.getByText("mou-signed.png")).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", { name: "Remove mou-signed.png" }),
      );
      expect(onChange).toHaveBeenLastCalledWith([]);
    });
  });

  it("AC-02.19 a stepper marks the current step, lets finished steps be revisited, and locks later ones", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <Stepper
        steps={[
          { id: "details", label: "Details" },
          { id: "documents", label: "Documents" },
          { id: "leads", label: "Representative leads" },
          { id: "review", label: "Review" },
        ]}
        current={1}
        onStepChange={onStepChange}
      />,
    );
    const step = (name: RegExp) => screen.getByRole("button", { name });
    expect(step(/^Documents/)).toHaveAttribute("aria-current", "step");
    expect(step(/^Details/)).toHaveAccessibleName(/^Details\s*\(finished\)$/);
    expect(step(/^Representative leads/)).toBeDisabled();
    expect(step(/^Review/)).toBeDisabled();

    await user.click(step(/^Details/));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it("AC-02.19 once the current step is finished, the next one opens", () => {
    render(
      <Stepper
        steps={[
          { id: "details", label: "Details" },
          { id: "documents", label: "Documents" },
          { id: "review", label: "Review" },
        ]}
        current={1}
        completed={2}
        onStepChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /^Review/ })).toBeEnabled();
  });

  describe("AC-02.20 form error summary", () => {
    type Values = { name: string; phone: string; tin: string };
    function SummaryForm({ fields }: { fields: (keyof Values)[] }) {
      const form = useForm<Values>({
        initialValues: { name: "", phone: "", tin: "" },
        validate: Object.fromEntries(
          fields.map((f) => [
            f,
            (v: string) => (v ? undefined : `Enter the ${f}`),
          ]),
        ),
        onSubmit: async () => {},
      });
      return (
        <Form form={form} aria-label="Union">
          <FormField name="name" label="Union name">
            {(field) => <Input {...field.inputProps} />}
          </FormField>
          <FormField name="phone" label="Phone">
            {(field) => <Input {...field.inputProps} />}
          </FormField>
          <FormField name="tin" label="TIN">
            {(field) => <Input {...field.inputProps} />}
          </FormField>
          <FormSubmit>Save</FormSubmit>
        </Form>
      );
    }

    it("with three or more problems, shows a focused summary linking to each field", async () => {
      const user = userEvent.setup();
      render(<SummaryForm fields={["name", "phone", "tin"]} />);
      await user.click(screen.getByRole("button", { name: "Save" }));

      const summary = await screen.findByRole("alert");
      expect(summary).toHaveTextContent("3 fields need attention");
      await waitFor(() => expect(summary).toHaveFocus());
      const links = within(summary).getAllByRole("link");
      expect(links.map((l) => l.textContent)).toEqual([
        "Union name: Enter the name",
        "Phone: Enter the phone",
        "TIN: Enter the tin",
      ]);
      await user.click(links[1]!);
      expect(screen.getByLabelText("Phone")).toHaveFocus();

      await user.type(screen.getByLabelText("Phone"), "0911");
      expect(within(summary).getAllByRole("link")).toHaveLength(2);
    });

    it("with fewer, focuses the first invalid field and shows no summary", async () => {
      const user = userEvent.setup();
      render(<SummaryForm fields={["phone", "tin"]} />);
      await user.click(screen.getByRole("button", { name: "Save" }));
      await waitFor(() => expect(screen.getByLabelText("Phone")).toHaveFocus());
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("AC-02.21 empty states and banners show the app's copy", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <>
        <EmptyState
          title="No agents yet"
          description="Agents appear here once they finish onboarding."
          action={<button>Invite an agent</button>}
        />
        <Banner tone="danger" title="Agents could not be loaded">
          Try again in a minute.
        </Banner>
        <Banner tone="warning" onDismiss={onDismiss}>
          The bank link service is slow today.
        </Banner>
      </>,
    );
    expect(screen.getByText("No agents yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Invite an agent" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Agents could not be loadedTry again in a minute.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "The bank link service is slow today.",
    );
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
