"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "../lib/cn";

/** The kit's series colours, in order; a series without `color` takes the next one. */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--brand-primary)",
  "var(--status-processing)",
] as const;

export type ChartRow = Record<string, string | number | null | undefined>;

export type ChartSeries = {
  /** The row field holding this series' numbers. */
  key: string;
  label: string;
  /** A CSS colour, normally a token such as `var(--chart-2)`. */
  color?: string;
};

type CommonProps = {
  data: ChartRow[];
  /** What the chart shows, read by screen readers, e.g. "Transactions per day this week". */
  label: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Formats numbers on the axis and in the tooltip. */
  valueFormatter?: (value: number) => string;
  /** Shown instead of empty axes when `data` has no rows. */
  emptyState?: ReactNode;
  className?: string;
};

export type CartesianChartProps = CommonProps & {
  type: "line" | "bar" | "area";
  /** The row field used for the horizontal axis, e.g. `"day"`. */
  xKey: string;
  series: ChartSeries[];
  showGrid?: boolean;
  /** Stacks bars or areas instead of drawing them side by side. */
  stacked?: boolean;
  /** The value axis width in pixels; `"auto"` (the default) fits the longest label. */
  yAxisWidth?: number | "auto";
};

export type DonutChartProps = CommonProps & {
  type: "donut";
  /** The row field holding each slice's number. */
  valueKey: string;
  /** The row field holding each slice's name. */
  nameKey: string;
  /** Slice colours, in row order; defaults to the kit's chart colours. */
  colors?: string[];
};

export type ChartProps = CartesianChartProps | DonutChartProps;

const axisTick = { fill: "var(--text-muted)", fontSize: 12 };
const tooltipStyle = {
  background: "var(--surface-card)",
  border: "1px solid var(--border-muted)",
  borderRadius: "var(--radius-box)",
  color: "var(--text-strong)",
  fontSize: 12,
};

function colorOf(series: ChartSeries, index: number) {
  return series.color ?? CHART_COLORS[index % CHART_COLORS.length]!;
}

/**
 * Line, bar, area and donut charts on recharts, coloured from the tokens.
 * Import from `@kifiya/ui/chart`; apps that use it install `recharts`.
 */
export function Chart(props: ChartProps) {
  const {
    data,
    label,
    height = 280,
    showLegend = true,
    showTooltip = true,
    valueFormatter,
    emptyState = "No data to show",
    className,
  } = props;

  const format = valueFormatter
    ? (value: unknown) =>
        typeof value === "number" ? valueFormatter(value) : String(value)
    : undefined;

  return (
    <div
      data-slot="chart"
      role="img"
      aria-label={label}
      className={cn("w-full text-xs", className)}
      style={{ height }}
    >
      {data.length === 0 ? (
        <div
          data-slot="chart-empty"
          className="flex size-full items-center justify-center rounded-(--radius-box) border border-dashed border-(--border-muted) text-sm text-(--text-muted)"
        >
          {emptyState}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {props.type === "donut"
            ? renderDonut(props, showLegend, showTooltip, format)
            : renderCartesian(props, showLegend, showTooltip, format)}
        </ResponsiveContainer>
      )}
    </div>
  );
}

type Format = ((value: unknown) => string) | undefined;

function renderDonut(
  props: DonutChartProps,
  showLegend: boolean,
  showTooltip: boolean,
  format: Format,
) {
  const colors = props.colors ?? CHART_COLORS;
  return (
    <PieChart>
      <Pie
        data={props.data}
        dataKey={props.valueKey}
        nameKey={props.nameKey}
        innerRadius="55%"
        outerRadius="80%"
        paddingAngle={2}
        stroke="var(--surface-card)"
        isAnimationActive={false}
      >
        {props.data.map((row, index) => (
          <Cell
            key={String(row[props.nameKey] ?? index)}
            fill={colors[index % colors.length]}
          />
        ))}
      </Pie>
      {showTooltip ? (
        <Tooltip contentStyle={tooltipStyle} formatter={format} />
      ) : null}
      {showLegend ? <Legend iconType="circle" /> : null}
    </PieChart>
  );
}

function renderCartesian(
  props: CartesianChartProps,
  showLegend: boolean,
  showTooltip: boolean,
  format: Format,
) {
  const {
    type,
    data,
    xKey,
    series,
    showGrid = true,
    stacked = false,
    yAxisWidth = "auto",
  } = props;
  const axes = [
    showGrid ? (
      <CartesianGrid
        key="grid"
        stroke="var(--border-soft)"
        strokeDasharray="3 3"
        vertical={false}
      />
    ) : null,
    <XAxis
      key="x"
      dataKey={xKey}
      tick={axisTick}
      tickLine={false}
      axisLine={{ stroke: "var(--border-muted)" }}
    />,
    <YAxis
      key="y"
      tick={axisTick}
      tickLine={false}
      axisLine={false}
      tickFormatter={format}
      width={yAxisWidth}
    />,
    showTooltip ? (
      <Tooltip
        key="tooltip"
        contentStyle={tooltipStyle}
        formatter={format}
        cursor={{ fill: "var(--surface-hover)" }}
      />
    ) : null,
    showLegend ? <Legend key="legend" iconType="circle" /> : null,
  ];
  const stackId = stacked ? "stack" : undefined;

  if (type === "bar") {
    return (
      <BarChart data={data}>
        {axes}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={colorOf(s, i)}
            stackId={stackId}
            radius={stacked ? 0 : [4, 4, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    );
  }
  if (type === "area") {
    return (
      <AreaChart data={data}>
        {axes}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={colorOf(s, i)}
            fill={colorOf(s, i)}
            fillOpacity={0.2}
            stackId={stackId}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    );
  }
  return (
    <LineChart data={data}>
      {axes}
      {series.map((s, i) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.label}
          stroke={colorOf(s, i)}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      ))}
    </LineChart>
  );
}
