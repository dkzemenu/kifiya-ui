"use client";

import { Inbox, SearchX } from "lucide-react";
import { useState } from "react";

import {
  Banner,
  EmptyState,
  Form,
  FormField,
  FormSubmit,
  Input,
  PortalButton,
  useForm,
} from "@kifiya/ui";

export function EmptyStates() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-(--radius-panel) border border-(--border-soft)">
        <EmptyState
          icon={Inbox}
          title="No applications to review"
          description="New agent applications appear here as soon as they are submitted."
        />
      </div>
      <div className="rounded-(--radius-panel) border border-(--border-soft)">
        <EmptyState
          size="compact"
          icon={SearchX}
          title="No agents match these filters"
          description="Try another status, or clear the search."
          action={<PortalButton variant="outline">Clear filters</PortalButton>}
        />
      </div>
    </div>
  );
}

export function Banners() {
  const [shown, setShown] = useState(true);
  return (
    <div className="grid gap-3">
      <Banner
        tone="danger"
        title="Agents could not be loaded"
        action={
          <PortalButton size="sm" variant="outline">
            Try again
          </PortalButton>
        }
      >
        The agent service did not answer. Your filters are kept.
      </Banner>
      <Banner tone="warning" title="Bank linking is slow">
        New unions may take a few minutes to show as linked.
      </Banner>
      <Banner tone="success">The commission structure was published.</Banner>
      {shown ? (
        <Banner tone="info" onDismiss={() => setShown(false)}>
          This union is read-only while its application is under review.
        </Banner>
      ) : (
        <PortalButton variant="ghost" onClick={() => setShown(true)}>
          Show the dismissed banner
        </PortalButton>
      )}
    </div>
  );
}

type UnionDraft = { name: string; tin: string; phone: string; bank: string };

export function ErrorSummaryExample() {
  const form = useForm<UnionDraft>({
    initialValues: { name: "", tin: "", phone: "", bank: "" },
    validate: {
      name: (v) => (v.trim() ? undefined : "Enter the union name"),
      tin: (v) => (/^\d{10}$/.test(v) ? undefined : "Enter a 10-digit TIN"),
      phone: (v) =>
        /^0[79]\d{8}$/.test(v)
          ? undefined
          : "Enter a mobile number like 0912345678",
      bank: (v) => (v.trim() ? undefined : "Enter the bank account number"),
    },
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    },
  });
  return (
    <Form form={form} aria-label="New union" className="max-w-md">
      <FormField name="name" label="Union name">
        {(field) => <Input {...field.inputProps} />}
      </FormField>
      <FormField name="tin" label="TIN">
        {(field) => <Input {...field.inputProps} inputMode="numeric" />}
      </FormField>
      <FormField name="phone" label="Phone number">
        {(field) => <Input {...field.inputProps} inputMode="tel" />}
      </FormField>
      <FormField name="bank" label="Bank account number">
        {(field) => <Input {...field.inputProps} />}
      </FormField>
      <div>
        <FormSubmit>Save union</FormSubmit>
      </div>
    </Form>
  );
}
