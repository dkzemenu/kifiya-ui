"use client";

import { Chart } from "@kifiya/ui/chart";

const week = [
  { day: "Mon", cashIn: 120, cashOut: 90, transfers: 40 },
  { day: "Tue", cashIn: 150, cashOut: 110, transfers: 55 },
  { day: "Wed", cashIn: 98, cashOut: 130, transfers: 62 },
  { day: "Thu", cashIn: 170, cashOut: 125, transfers: 48 },
  { day: "Fri", cashIn: 210, cashOut: 160, transfers: 75 },
  { day: "Sat", cashIn: 180, cashOut: 140, transfers: 66 },
  { day: "Sun", cashIn: 95, cashOut: 70, transfers: 30 },
];

const birr = (value: number) => `ETB ${value.toLocaleString("en-US")}k`;

export function LineChartExample() {
  return (
    <Chart
      type="line"
      label="Cash in and cash out per day this week"
      data={week}
      xKey="day"
      series={[
        { key: "cashIn", label: "Cash in" },
        { key: "cashOut", label: "Cash out" },
      ]}
      valueFormatter={birr}
    />
  );
}

export function BarChartExample() {
  return (
    <Chart
      type="bar"
      label="Transactions per day this week, by type"
      data={week}
      xKey="day"
      series={[
        { key: "cashIn", label: "Cash in" },
        { key: "cashOut", label: "Cash out" },
        { key: "transfers", label: "Transfers" },
      ]}
      stacked
    />
  );
}

export function AreaChartExample() {
  return (
    <Chart
      type="area"
      label="Transfers per day this week"
      data={week}
      xKey="day"
      series={[
        { key: "transfers", label: "Transfers", color: "var(--brand-primary)" },
      ]}
      showLegend={false}
      height={200}
    />
  );
}

export function DonutChartExample() {
  return (
    <Chart
      type="donut"
      label="Agents by status"
      data={[
        { status: "Active", agents: 128 },
        { status: "Pending", agents: 24 },
        { status: "Suspended", agents: 9 },
      ]}
      valueKey="agents"
      nameKey="status"
      height={240}
    />
  );
}

export function EmptyChartExample() {
  return (
    <Chart
      type="line"
      label="Cash in per day"
      data={[]}
      xKey="day"
      series={[{ key: "cashIn", label: "Cash in" }]}
      emptyState="No transactions in this period"
      height={180}
    />
  );
}
