"use client";

import { CheckCircle2, Clock, Users, Wallet } from "lucide-react";

import {
  PageSectionCard,
  PortalButton,
  PortalMetricStatCard,
  PortalPermissionDenied,
  PortalStatCard,
  PortalStatusChip,
} from "@kifiya/ui";

export function StatusChips() {
  return (
    <div className="flex flex-wrap gap-2">
      <PortalStatusChip label="Approved" tone="success" icon={CheckCircle2} />
      <PortalStatusChip label="Pending" tone="warning" icon={Clock} />
      <PortalStatusChip label="Rejected" tone="danger" />
      <PortalStatusChip label="Draft" tone="neutral" />
      <PortalStatusChip label="Processing" tone="processing" />
    </div>
  );
}

export function StatCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <PortalStatCard
        label="Total agents"
        value="1,284"
        delta="+4.2%"
        deltaTone="positive"
        icon={Users}
        tone="card"
      />
      <PortalStatCard
        label="Float balance"
        value="ETB 92,400"
        subtitle="Across 3 accounts"
        icon={Wallet}
        tone="brand"
      />
      <PortalStatCard
        label="Pending approval"
        value="18"
        delta="-3"
        deltaTone="negative"
        icon={Clock}
        tone="warning"
        size="compact"
      />
    </div>
  );
}

export function MetricStatCard() {
  return (
    <div className="grid max-w-md gap-4">
      <PortalMetricStatCard
        item={{
          label: "Transactions",
          value: "35",
          delta: "+12.5%",
          deltaTone: "positive",
        }}
        icon={Wallet}
      />
      <PortalMetricStatCard
        item={{
          label: "Failed",
          value: "4",
          subtitle: "11.4% failure rate",
          deltaTone: "danger",
        }}
        icon={Clock}
        iconVariant="charcoal"
      />
    </div>
  );
}

export function SectionCard() {
  return (
    <PageSectionCard
      title="Business information"
      description="Sample section card."
      action={
        <PortalButton size="sm" variant="outline">
          Edit
        </PortalButton>
      }
    >
      <p className="text-sm">Section content goes here.</p>
    </PageSectionCard>
  );
}

export function PermissionDenied() {
  return <PortalPermissionDenied resourceLabel="commissions" />;
}
