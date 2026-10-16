"use client";

import { useState } from "react";

import {
  Autocomplete,
  Calendar,
  CalendarDayButton,
  Checkbox,
  DatePicker,
  Form,
  FormField,
  FormSubmit,
  Input,
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
