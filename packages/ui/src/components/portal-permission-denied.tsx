import { ShieldAlert } from "lucide-react";

import { cn } from "../lib/cn";

/**
 * Friendly empty-state for HTTP 403 responses — shown instead of a raw error
 * banner when the signed-in user lacks the backend permission for a resource.
 */
export function PortalPermissionDenied({
  resourceLabel = "this section",
  className,
}: {
  /** e.g. "commissions", "transaction limits" */
  resourceLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-(--radius-panel) border border-(--border-soft) bg-(--surface-card) px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-(--surface-subtle) text-(--text-muted)">
        <ShieldAlert className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
      <div>
        <p className="text-base font-semibold text-(--text-heading)">
          You don&apos;t have access to {resourceLabel}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-(--text-muted)">
          Your account is missing the required permission. Contact your
          administrator if you believe you should have access.
        </p>
      </div>
    </div>
  );
}
