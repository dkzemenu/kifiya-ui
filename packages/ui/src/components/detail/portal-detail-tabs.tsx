"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "../../lib/cn";

import type { PortalDetailTab } from "./types";

export interface PortalDetailTabsProps {
  tabs: PortalDetailTab[];
  defaultTabId?: string;
  /**
   * Keeps the tab panel height stable when switching tabs by stacking all tab
   * panels in one grid cell (height = tallest tab). Inactive panels stay
   * mounted but are hidden from view and pointer interaction.
   */
  preservePanelHeight?: boolean;
  panelClassName?: string;
}

export function PortalDetailTabs({
  tabs,
  defaultTabId,
  preservePanelHeight = false,
  panelClassName,
}: PortalDetailTabsProps) {
  const initialTabId = useMemo(() => {
    if (!tabs.length) {
      return "";
    }

    if (defaultTabId && tabs.some((tab) => tab.id === defaultTabId)) {
      return defaultTabId;
    }

    return tabs[0]?.id ?? "";
  }, [defaultTabId, tabs]);
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  useEffect(() => {
    setActiveTabId(initialTabId);
  }, [initialTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <div className="min-w-0 space-y-4">
      <div
        className="flex items-center gap-8 overflow-x-auto border-b border-(--border-soft)"
        role="tablist"
        aria-label="Detail sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab.id === tab.id}
            className={cn(
              "-mb-px border-b-[3px] pb-3 text-sm font-semibold transition-colors",
              activeTab.id === tab.id
                ? "border-(--brand-primary) text-(--text-heading)"
                : "border-transparent text-(--text-muted) hover:text-(--text-heading)",
            )}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {preservePanelHeight ? (
        <div
          className={cn("grid w-full min-w-0", panelClassName)}
          role="tabpanel"
          aria-label={activeTab.label}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;
            return (
              <div
                key={tab.id}
                className="col-start-1 row-start-1 min-w-0 w-full"
                style={
                  isActive ? undefined : { opacity: 0, pointerEvents: "none" }
                }
                aria-hidden={!isActive}
              >
                {tab.content}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={cn("w-full min-w-0", panelClassName)}
          role="tabpanel"
          aria-label={activeTab.label}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
