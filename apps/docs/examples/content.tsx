"use client";

import { Bell, CircleCheck, TriangleAlert, Wallet } from "lucide-react";

import { Icon, Image, Logo, Text } from "@kifiya/ui";

const base = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

export function TextScale() {
  return (
    <div className="grid gap-3">
      <Text variant="title">Agent network</Text>
      <Text variant="heading">Pending reviews</Text>
      <Text variant="subheading">Business information</Text>
      <Text>
        Body text for paragraphs and descriptions. It uses the body colour from
        the tokens.
      </Text>
      <Text variant="small">Small text for dense tables and notes.</Text>
      <Text variant="caption">Updated 5 minutes ago</Text>
      <Text variant="label">Registration number</Text>
      <Text variant="metric">ETB 1,284,500</Text>
    </div>
  );
}

export function TextTones() {
  return (
    <div className="flex flex-wrap gap-4">
      <Text tone="strong">Strong</Text>
      <Text tone="muted">Muted</Text>
      <Text tone="brand">Brand</Text>
      <Text tone="success">Approved</Text>
      <Text tone="warning">Awaiting documents</Text>
      <Text tone="danger">Rejected</Text>
      <Text variant="heading" as="p" weight="medium">
        A heading-sized paragraph
      </Text>
    </div>
  );
}

export function Icons() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Icon icon={Bell} size="xs" />
      <Icon icon={Bell} size="sm" />
      <Icon icon={Bell} size="md" />
      <Icon icon={Bell} size="lg" />
      <Icon icon={Bell} size="xl" tone="brand" />
      <Icon icon={CircleCheck} size="lg" tone="success" label="Verified" />
      <Icon icon={TriangleAlert} size="lg" tone="warning" label="Warning" />
      <Icon icon={Wallet} size="lg" tone="muted" />
    </div>
  );
}

export function Images() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Image
        src={`${base}/example-landscape.png`}
        alt="Sample landscape"
        aspectRatio={16 / 9}
      />
      <Image
        src={`${base}/example-landscape.png`}
        alt="Sample landscape, square crop"
        aspectRatio={1}
        frameClassName="rounded-(--radius-panel)"
      />
      <Image
        src={`${base}/does-not-exist.png`}
        alt="Missing document scan"
        aspectRatio={16 / 9}
        fallback="Image unavailable"
      />
    </div>
  );
}

export function Logos() {
  return (
    <div className="flex flex-wrap items-end gap-8">
      <Logo />
      <Logo className="h-12" />
      <Logo variant="mark" className="h-10" />
      <div className="flex items-center gap-2">
        <Logo variant="mark" title="" className="h-6" />
        <Text variant="label">Agent Portal</Text>
      </div>
    </div>
  );
}
