"use client";

import { ArrowRight, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { PortalButton } from "../portal-button";
import { Card, CardContent } from "../../primitives/card";
import { cn } from "../../lib/cn";

export interface PortalDetailStepperTab {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  content: ReactNode;
}

export interface PortalDetailStepperTabsProps {
  /** Tabs in display order; render an ordered list upstream (this component does not reorder). */
  tabs: PortalDetailStepperTab[];
  defaultTabId?: string;
  ariaLabel: string;
}

/**
 * Card-wrapped, icon-labelled tab bar with a "Step X of Y" + "Continue to
 * next" footer. Shared by onboarding-style detail pages (customer, agent)
 * so the stepper look stays identical across them.
 */
export function PortalDetailStepperTabs({
  tabs,
  defaultTabId,
  ariaLabel,
}: PortalDetailStepperTabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId ?? tabs[0]?.id);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);
  const activeTab = tabs[activeIndex] ?? tabs[0];
  const nextTab = tabs[activeIndex + 1];

  return (
    <Card className="min-w-0 gap-0 rounded-(--radius-card) border border-(--border-soft) py-0 shadow-sm">
      <div className="border-b border-(--border-soft) px-6 pt-5">
        <div
          className="flex items-center gap-8 overflow-x-auto pr-6"
          role="tablist"
          aria-label={ariaLabel}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab?.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "-mb-px inline-flex items-center gap-2 border-b-[3px] pb-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
                  isActive
                    ? "border-(--brand-primary) text-(--brand-primary)"
                    : "border-transparent text-(--text-muted) hover:text-(--text-heading)",
                )}
                onClick={() => setActiveTabId(tab.id)}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-(--brand-primary)" : "text-(--text-muted)",
                  )}
                  aria-hidden
                />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span
                    className={cn(
                      "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                      isActive
                        ? "bg-(--brand-primary-soft) text-(--brand-primary)"
                        : "bg-(--surface-subtle) text-(--text-muted)",
                    )}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="min-w-0 px-6 py-6">
        {activeTab?.content}
      </CardContent>

      <div className="flex flex-col gap-3 border-t border-(--border-soft) px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-(--text-muted)">
          Step {Math.max(activeIndex, 0) + 1} of {tabs.length}
        </p>
        {nextTab ? (
          <PortalButton
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            rightIcon={<ArrowRight className="size-4 shrink-0" aria-hidden />}
            onClick={() => setActiveTabId(nextTab.id)}
          >
            Continue to {nextTab.label}
          </PortalButton>
        ) : null}
      </div>
    </Card>
  );
}
