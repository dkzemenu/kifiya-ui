"use client";

import type { LucideIcon } from "lucide-react";

import type { OverviewMetric } from "./types";

import { PortalStatCard } from "./portal-stat-card";

function mapDeltaTone(
  item: OverviewMetric,
): "positive" | "negative" | "neutral" | undefined {
  if (!item.delta) return undefined;
  switch (item.deltaTone) {
    case "positive":
      return "positive";
    case "negative":
      return "negative";
    case "neutral":
    case "danger":
      return "neutral";
    default:
      return "neutral";
  }
}

export function PortalMetricStatCard({
  item,
  icon: Icon,
  iconVariant = "default",
  iconClassName,
  size,
  className,
}: {
  item: OverviewMetric;
  icon: LucideIcon;
  iconVariant?: "default" | "charcoal";
  iconClassName?: string;
  size?: "default" | "compact";
  className?: string;
}) {
  return (
    <PortalStatCard
      label={item.label}
      value={item.value}
      delta={item.delta}
      subtitle={item.subtitle}
      icon={Icon}
      tone="card"
      deltaTone={mapDeltaTone(item)}
      iconVariant={iconVariant}
      iconClassName={iconClassName}
      size={size}
      className={className}
    />
  );
}
