"use client";

import type { ReactNode } from "react";

import type { PortalChipProps } from "../portal-status-chip";

export interface PortalDetailMetaItem {
  label: string;
  value: ReactNode;
}

export interface PortalDetailField {
  label: string;
  value: ReactNode;
}

export interface PortalDetailSectionGroup {
  title?: string;
  fields: PortalDetailField[];
}

export interface PortalDetailTab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface PortalDetailHeader {
  title: string;
  subtitle?: ReactNode;
  meta?: PortalDetailMetaItem[];
  badges?: Pick<PortalChipProps, "label" | "tone">[];
}
