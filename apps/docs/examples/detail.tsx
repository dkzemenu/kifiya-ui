"use client";

import { Building2, FileText, User } from "lucide-react";
import { useState } from "react";

import {
  PortalApplicationStatusLayout,
  PortalBusinessInformationLayout,
  PortalButton,
  PortalDetailDefinitionRows,
  PortalDetailInfoSubsection,
  PortalDetailPanelShell,
  PortalDetailRowsSection,
  PortalDetailSection,
  PortalDetailStepperTabs,
  PortalDetailTabs,
  PortalDetailTwoColumnStackedGrid,
  PortalPersonalInformationLayout,
  PortalReviewNotesPanel,
  type PortalDetailField,
  type PortalReviewNote,
} from "@kifiya/ui";

// Synthetic values only (PRODUCT.md R-91).
const personal: PortalDetailField[] = [
  { label: "Full name", value: "Sample Person" },
  { label: "Phone", value: "0900000000" },
  { label: "Date of birth", value: "1990-01-01" },
];
const address: PortalDetailField[] = [
  { label: "Region", value: "Region A" },
  { label: "City", value: "Sample City" },
];
const emergency: PortalDetailField[] = [
  { label: "Contact", value: "Sample Contact" },
  { label: "Phone", value: "0900000001" },
];

export function Tabs() {
  return (
    <PortalDetailTabs
      tabs={[
        {
          id: "overview",
          label: "Overview",
          content: <PortalDetailDefinitionRows fields={personal} />,
        },
        {
          id: "address",
          label: "Address",
          content: <PortalDetailDefinitionRows fields={address} />,
        },
      ]}
    />
  );
}

export function StepperTabs() {
  return (
    <PortalDetailStepperTabs
      ariaLabel="Application sections"
      tabs={[
        {
          id: "personal",
          label: "Personal",
          icon: User,
          content: <PortalDetailTwoColumnStackedGrid fields={personal} />,
        },
        {
          id: "business",
          label: "Business",
          icon: Building2,
          content: <PortalDetailTwoColumnStackedGrid fields={address} />,
        },
        {
          id: "documents",
          label: "Documents",
          icon: FileText,
          badge: "2",
          content: <p className="text-sm">Documents</p>,
        },
      ]}
    />
  );
}

export function PanelShell() {
  return (
    <PortalDetailPanelShell
      header={{
        title: "Sample Agent",
        subtitle: "AG-1000",
        meta: [
          { label: "Region", value: "Region A" },
          { label: "Joined", value: "2026-01-01" },
        ],
        badges: [{ label: "Active", tone: "success" }],
      }}
      actions={<PortalButton size="sm">Approve</PortalButton>}
    >
      <PortalDetailSection
        title="Profile"
        groups={[
          { title: "Personal", fields: personal },
          { title: "Address", fields: address },
        ]}
      />
    </PortalDetailPanelShell>
  );
}

export function Sections() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PortalDetailSection
        groups={[{ fields: personal }]}
        rowVariant="divided"
      />
      <PortalDetailRowsSection title="Rows section" rows={address} />
      <PortalDetailInfoSubsection title="Info subsection" fields={emergency} />
      <PortalDetailTwoColumnStackedGrid fields={[...personal, ...address]} />
    </div>
  );
}

export function PersonalInformation() {
  return (
    <PortalPersonalInformationLayout split={{ personal, address, emergency }} />
  );
}

export function BusinessInformation() {
  return (
    <PortalBusinessInformationLayout
      split={{
        business: [{ label: "Business name", value: "Sample Trading" }],
        businessAddress: address,
        financial: [{ label: "Bank", value: "Sample Bank" }],
      }}
    />
  );
}

export function ApplicationStatus() {
  return (
    <PortalApplicationStatusLayout
      split={{
        fraudEngineBadgeLabel: "Low risk",
        fraudEngineTone: "success",
        verificationChecks: [
          {
            id: "id",
            label: "Identity document",
            badgeLabel: "Verified",
            tone: "success",
          },
          {
            id: "phone",
            label: "Phone number",
            badgeLabel: "Pending",
            tone: "warning",
          },
        ],
      }}
    />
  );
}

export function ReviewNotes() {
  const [notes, setNotes] = useState<PortalReviewNote[]>([
    {
      id: "1",
      message: "Sample note from a reviewer.",
      createdAt: "2026-01-02 10:00",
    },
  ]);
  return (
    <PortalReviewNotesPanel
      notes={notes}
      onSaveNote={(message) =>
        setNotes((current) => [
          ...current,
          { id: String(current.length + 1), message, createdAt: "just now" },
        ])
      }
    />
  );
}
