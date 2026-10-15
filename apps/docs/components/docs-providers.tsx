"use client";

import { KifiyaUIProvider, Toaster, TooltipProvider } from "@kifiya/ui";
import Link from "next/link";
import { useTheme } from "nextra-theme-docs";
import type { ReactNode } from "react";

/** The same app-level setup the README tells consumers to add. */
export function DocsProviders({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <KifiyaUIProvider linkComponent={Link}>
      <TooltipProvider>
        {children}
        <Toaster theme={resolvedTheme === "dark" ? "dark" : "light"} />
      </TooltipProvider>
    </KifiyaUIProvider>
  );
}
