/**
 * KPI tile for overview grids (headline value + optional delta/subtitle).
 */
export interface OverviewMetric {
  label: string;
  value: string;
  /** Trend vs previous period (e.g. `+12.5%`). Omit when only a subtitle is shown. */
  delta?: string;
  /** Secondary line (e.g. failure rate copy). */
  subtitle?: string;
  deltaTone: "positive" | "negative" | "neutral" | "danger";
}
