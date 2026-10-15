/**
 * Standard widths for recurring column archetypes, so the same kind of
 * column (a status badge, a phone number, a trailing actions menu, ...)
 * renders at the same width in every PortalTable across the app.
 */
export const PORTAL_TABLE_COLUMN_WIDTH = {
  selection: "56px",
  chevron: "48px",
  actions: "56px",
  status: "160px",
  phone: "11rem",
  region: "160px",
  date: "150px",
  amount: "130px",
  label: "170px",
  name: "220px",
  avatarName: "240px",
  description: "280px",
} as const;

/**
 * Fallback floor for a column a caller left without an explicit `width`.
 * Every current column sets one of the widths above, but table rows use
 * `table-layout: fixed`, so an unset column would otherwise get squeezed
 * toward zero on narrow viewports instead of the table scrolling
 * horizontally.
 */
export const PORTAL_TABLE_FLEXIBLE_COLUMN_MIN_WIDTH = 220;

function widthToPx(width: string | number | undefined): number {
  if (typeof width === "number") {
    return width;
  }
  if (typeof width !== "string") {
    return 0;
  }

  const remMatch = /^([\d.]+)rem$/.exec(width);
  if (remMatch) {
    return parseFloat(remMatch[1]!) * 16;
  }

  const pxMatch = /^([\d.]+)px$/.exec(width);
  if (pxMatch) {
    return parseFloat(pxMatch[1]!);
  }

  return 0;
}

/**
 * Sum of every column's width (explicit widths as declared, flexible
 * columns floored at `PORTAL_TABLE_FLEXIBLE_COLUMN_MIN_WIDTH`), used as the
 * table's `min-width` so a fixed-layout table degrades to horizontal
 * scrolling on narrow screens instead of crushing its flexible columns.
 */
export function computePortalTableMinWidth(
  columns: { width?: string | number }[],
): number {
  return columns.reduce(
    (sum, column) =>
      sum +
      (column.width
        ? widthToPx(column.width)
        : PORTAL_TABLE_FLEXIBLE_COLUMN_MIN_WIDTH),
    0,
  );
}
