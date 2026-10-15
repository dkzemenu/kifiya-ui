"use client";

import { LayoutDashboard } from "lucide-react";

import {
  KifiyaUIProvider,
  PortalButton,
  PortalSidebarNavItem,
  type KifiyaLinkProps,
} from "@kifiya/ui";

/** Stand-in for a router link (in a Next.js app: `import Link from "next/link"`). */
function DemoRouterLink({ onClick, ...props }: KifiyaLinkProps) {
  return (
    <a
      {...props}
      data-router-link=""
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  );
}

/**
 * Wrap the app once so every navigating component uses its router:
 *
 * ```tsx
 * <KifiyaUIProvider linkComponent={Link}>{children}</KifiyaUIProvider>
 * ```
 *
 * Without the provider the kit renders plain `<a>` elements.
 */
export function LinkComponent() {
  return (
    <KifiyaUIProvider linkComponent={DemoRouterLink}>
      <div className="flex items-center gap-4">
        <PortalButton href="/agents">Go to agents</PortalButton>
        <div className="w-56 rounded-panel bg-(--sidebar-bg) p-2">
          <PortalSidebarNavItem
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            active
          />
        </div>
      </div>
    </KifiyaUIProvider>
  );
}
