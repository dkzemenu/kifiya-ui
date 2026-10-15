"use client";

import { useState } from "react";

import {
  Calendar,
  CalendarDayButton,
  Checkbox,
  DatePicker,
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
