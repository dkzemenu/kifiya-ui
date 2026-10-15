const overviewMetricsGridBaseClassName =
  "grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5";

/** Shared overview stat row — pair with `PortalMetricStatCard` `size="compact"`. */
export const portalOverviewMetricsGridClassName = `${overviewMetricsGridBaseClassName} mb-6 lg:grid-cols-4`;

/** Three-card overview rows (e.g. Limits). */
export const portalOverviewMetricsGridClassName3 = `${overviewMetricsGridBaseClassName} mb-6 lg:grid-cols-3`;

/** Dashboard overview row (tighter bottom margin). */
export const portalOverviewMetricsGridClassNameDashboard = `${overviewMetricsGridBaseClassName} mb-1 lg:grid-cols-4`;
