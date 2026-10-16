"use client";

import {
  ArrowRight,
  Building2,
  ClipboardList,
  Download,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import {
  NavMenu,
  PageHeader,
  PortalButton,
  PortalFilterSelect,
  PortalListPage,
  PortalSidebarNavItem,
  PortalStatusChip,
} from "@kifiya/ui";

export function Buttons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PortalButton>Primary</PortalButton>
      <PortalButton variant="secondary">Secondary</PortalButton>
      <PortalButton
        variant="outline"
        leftIcon={<Download className="size-4" />}
      >
        Export
      </PortalButton>
      <PortalButton variant="ghost">Ghost</PortalButton>
      <PortalButton variant="destructive">Reject</PortalButton>
      <PortalButton variant="success">Approve</PortalButton>
      <PortalButton loading>Saving</PortalButton>
      <PortalButton
        size="sm"
        href="#"
        rightIcon={<ArrowRight className="size-4" />}
      >
        As a link
      </PortalButton>
    </div>
  );
}

export function Header() {
  return (
    <PageHeader
      title="Agents"
      subtitle="Sample page header with search and actions."
      showSearch
      searchPlaceholder="Search agents"
      actions={<PortalButton>Onboard agent</PortalButton>}
      filterSlot={
        <PortalFilterSelect
          placeholder="Status"
          options={[
            { label: "All", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
          ]}
        />
      }
    />
  );
}

export function ListPage() {
  return (
    <PortalListPage
      title="Unions"
      subtitle="Sample list page."
      actions={<PortalButton variant="outline">Export</PortalButton>}
    >
      <div className="k-card border p-6 text-sm">
        Page content (usually a PortalTableCard).{" "}
        <PortalStatusChip label="Sample" />
      </div>
    </PortalListPage>
  );
}

export function SidebarNav() {
  return (
    <div className="w-64 space-y-1 rounded-panel bg-(--sidebar-bg) p-3">
      <PortalSidebarNavItem
        href="#"
        label="Dashboard"
        icon={LayoutDashboard}
        active
      />
      <PortalSidebarNavItem
        href="#"
        label="Agents"
        icon={Users}
        badgeCount={12}
      />
      <PortalSidebarNavItem href="#" label="Unions" icon={Building2} />
      <PortalSidebarNavItem
        label="Settings (no access)"
        icon={Settings}
        disabled
      />
      <div className="w-14 pt-3">
        <PortalSidebarNavItem
          href="#"
          label="Dashboard"
          icon={LayoutDashboard}
          collapsed
          active
        />
      </div>
    </div>
  );
}

export function NavMenuExample() {
  return (
    <NavMenu
      aria-label="Agent sections"
      currentPath="/agents/pending"
      items={[
        { label: "Overview", href: "/agents/overview" },
        { label: "Pending", href: "/agents/pending", count: 12 },
        { label: "Approved", href: "/agents/approved" },
        { label: "Reports", href: "/agents/reports", icon: ClipboardList },
      ]}
    />
  );
}
