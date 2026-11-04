"use client";

import { useState } from "react";

import {
  Autocomplete,
  Calendar,
  CalendarDayButton,
  Checkbox,
  CurrencyField,
  DatePicker,
  type DateRange,
  DateRangePicker,
  FileDropzone,
  Form,
  FormField,
  FormSubmit,
  Input,
  MultiSelect,
  NumberField,
  OtpInput,
  PortalButton,
  PortalFilterSelect,
  SearchInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Stepper,
  Switch,
  Textarea,
  useForm,
} from "@kifiya/ui";

export function Inputs() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input placeholder="Full name" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Invalid" aria-invalid />
      <SearchInput placeholder="Search agents" />
    </div>
  );
}

export function CheckboxAndSwitch() {
  const [checked, setChecked] = useState(true);
  const [on, setOn] = useState(false);
  return (
    <div className="flex items-center gap-6 text-sm">
      <label className="flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        Send SMS
      </label>
      <label className="flex items-center gap-2">
        <Switch checked={on} onCheckedChange={setOn} />
        Enabled
      </label>
    </div>
  );
}

export function SelectMenu() {
  return (
    <Select defaultValue="ACTIVE">
      <SelectTrigger className="w-56" aria-label="Status">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Open</SelectLabel>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Closed</SelectLabel>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function FilterSelect() {
  return (
    <PortalFilterSelect
      placeholder="Region"
      options={[
        { label: "All regions", value: "ALL" },
        { label: "Region A", value: "A" },
        { label: "Region B", value: "B" },
      ]}
    />
  );
}

export function DatePickers() {
  const [value, setValue] = useState("2026-01-15");
  return (
    <div className="max-w-xs">
      <DatePicker value={value} onChange={setValue} allowClear />
      <p className="mt-2 text-xs text-text-muted">Value: {value || "—"}</p>
    </div>
  );
}

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 15));
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 0, 1)}
      // CalendarDayButton is the default day cell; pass it (or your own) here.
      components={{ DayButton: CalendarDayButton }}
      className="rounded-card border border-border-soft bg-surface-card"
    />
  );
}

export function TextareaExample() {
  return (
    <div className="grid max-w-md gap-3">
      <Textarea placeholder="Reason for rejection" />
      <Textarea placeholder="Invalid" aria-invalid rows={2} />
    </div>
  );
}

type AgentOption = { id: string; name: string; code: string };

const AGENT_OPTIONS: AgentOption[] = [
  { id: "1", name: "Abebe Kebede", code: "AG-1001" },
  { id: "2", name: "Almaz Tesfaye", code: "AG-1002" },
  { id: "3", name: "Bekele Girma", code: "AG-1003" },
  { id: "4", name: "Hana Alemu", code: "AG-1004" },
  { id: "5", name: "Selam Bekele", code: "AG-1005" },
];

/** Stands in for the app's API call. */
async function searchAgents(query: string): Promise<AgentOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const q = query.toLowerCase();
  return AGENT_OPTIONS.filter(
    (a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
  );
}

export function AutocompleteExample() {
  const [agent, setAgent] = useState<AgentOption | null>(null);
  return (
    <div className="grid max-w-sm gap-2">
      <Autocomplete
        aria-label="Agent"
        placeholder="Search by name or code"
        value={agent}
        onChange={setAgent}
        search={searchAgents}
        getOptionKey={(a) => a.id}
        getOptionLabel={(a) => a.name}
        renderOption={(a) => (
          <span className="flex justify-between gap-3">
            {a.name}
            <span className="text-(--text-muted)">{a.code}</span>
          </span>
        )}
      />
      <p className="text-xs text-(--text-muted)">
        Selected: {agent ? `${agent.name} (${agent.code})` : "none"}
      </p>
    </div>
  );
}

type UnionForm = { name: string; phone: string; notes: string };

export function FormExample() {
  const [saved, setSaved] = useState<UnionForm | null>(null);
  const form = useForm<UnionForm>({
    initialValues: { name: "", phone: "", notes: "" },
    validate: {
      name: (value) => (value.trim() ? undefined : "Enter the union's name"),
      phone: (value) =>
        /^0[79]\d{8}$/.test(value)
          ? undefined
          : "Enter a mobile number like 0912345678",
    },
    onSubmit: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (values.phone === "0900000000") throw new Error("409");
      setSaved(values);
    },
    submitErrorMessage: () => "That phone number is already registered.",
  });
  return (
    <Form form={form} aria-label="New union" className="max-w-md">
      <FormField name="name" label="Union name">
        {(field) => <Input {...field.inputProps} />}
      </FormField>
      <FormField
        name="phone"
        label="Phone number"
        description="Try 0900000000 to see a failed submit."
      >
        {(field) => <Input {...field.inputProps} inputMode="tel" />}
      </FormField>
      <FormField name="notes" label="Notes" optional>
        {(field) => <Textarea {...field.inputProps} rows={3} />}
      </FormField>
      <div className="flex items-center gap-3">
        <FormSubmit>Save union</FormSubmit>
        {saved ? (
          <span className="text-sm text-(--status-success-strong)">
            Saved {saved.name}
          </span>
        ) : null}
      </div>
    </Form>
  );
}

const REGION_OPTIONS = [
  { value: "AA", label: "Addis Ababa" },
  { value: "OR", label: "Oromia" },
  { value: "AM", label: "Amhara" },
  { value: "SI", label: "Sidama" },
  { value: "DD", label: "Dire Dawa" },
];

export function MultiSelectExample() {
  const [regions, setRegions] = useState<string[]>(["AA", "OR"]);
  return (
    <div className="grid max-w-sm gap-2">
      <MultiSelect
        aria-label="Regions"
        placeholder="Choose regions"
        options={REGION_OPTIONS}
        value={regions}
        onChange={setRegions}
      />
      <p className="text-xs text-(--text-muted)">
        Value: {JSON.stringify(regions)}
      </p>
    </div>
  );
}

export function DateRangeExample() {
  const [range, setRange] = useState<DateRange | null>({
    start: "2026-09-11",
    end: "2026-09-30",
  });
  const [ethiopic, setEthiopic] = useState(false);
  return (
    <div className="grid max-w-md gap-3">
      <DateRangePicker
        aria-label="Report period"
        calendar={ethiopic ? "ethiopic" : "gregorian"}
        value={range}
        onChange={setRange}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={ethiopic}
          onChange={(event) => setEthiopic(event.target.checked)}
        />
        Show the Ethiopian calendar
      </label>
      <p className="text-xs text-(--text-muted)">
        Value (always Gregorian): {JSON.stringify(range)}
      </p>
    </div>
  );
}

export function NumberFields() {
  const [count, setCount] = useState<number | null>(12);
  const [limit, setLimit] = useState<number | null>(500000);
  return (
    <div className="grid max-w-sm gap-4">
      <NumberField
        aria-label="Maximum agents"
        value={count}
        onChange={setCount}
        minValue={0}
        showStepper
      />
      <CurrencyField
        aria-label="Daily limit"
        currency="ETB"
        amountMinor={limit}
        onChange={setLimit}
      />
      <p className="text-xs text-(--text-muted)">
        Daily limit in minor units (santim): {String(limit)}
      </p>
    </div>
  );
}

export function OtpExample() {
  const [code, setCode] = useState("");
  const [done, setDone] = useState<string | null>(null);
  return (
    <div className="grid gap-3">
      <OtpInput
        aria-label="Verification code"
        value={code}
        onChange={(next) => {
          setCode(next);
          setDone(null);
        }}
        onComplete={setDone}
      />
      <p className="text-xs text-(--text-muted)">
        {done ? `Complete: ${done}` : "Type or paste six digits."}
      </p>
    </div>
  );
}

export function FileDropzoneExample() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <FileDropzone
      className="max-w-md"
      label="MOU document"
      hint="PDF, JPG or PNG, up to 10 MB"
      accept={["application/pdf", "image/jpeg", "image/png"]}
      maxSizeBytes={10 * 1024 * 1024}
      value={files}
      onChange={setFiles}
    />
  );
}

const ONBOARDING_STEPS = [
  { id: "details", label: "Union details", description: "KYB, address, bank" },
  { id: "documents", label: "Documents" },
  { id: "leads", label: "Representative leads" },
  { id: "review", label: "Review" },
];

export function StepperExample() {
  const [current, setCurrent] = useState(1);
  const [completed, setCompleted] = useState(1);
  return (
    <div className="grid gap-4">
      <Stepper
        steps={ONBOARDING_STEPS}
        current={current}
        completed={completed}
        onStepChange={setCurrent}
      />
      <div className="flex gap-2">
        <PortalButton
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent(current - 1)}
        >
          Back
        </PortalButton>
        <PortalButton
          disabled={current === ONBOARDING_STEPS.length - 1}
          onClick={() => {
            setCompleted(Math.max(completed, current + 1));
            setCurrent(current + 1);
          }}
        >
          Next
        </PortalButton>
      </div>
    </div>
  );
}
