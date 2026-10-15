"use client";

import { cn } from "@kifiya/ui";
import { Check, Copy, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

import { examples, sources } from "../examples/registry.generated";

const viewports = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "375px" },
] as const;

type ViewportId = (typeof viewports)[number]["id"];

/**
 * A live example with Preview and Code tabs, a viewport toggle and a copy
 * button. `name` is "<file>/<ExportName>" from apps/docs/examples.
 */
export function Example({ name }: { name: string }) {
  const Component = examples[name];
  const source = sources[name];
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState<ViewportId>("desktop");
  const [copied, setCopied] = useState(false);

  if (!Component || source === undefined) {
    throw new Error(`Unknown example "${name}". Run \`pnpm examples\`.`);
  }

  const width = viewports.find((v) => v.id === viewport)!.width;

  async function copy() {
    await navigator.clipboard.writeText(source!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="not-prose mt-4 overflow-hidden rounded-panel border border-border-soft bg-surface-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft px-3 py-2">
        <div role="tablist" aria-label="Example view" className="flex gap-1">
          {(["preview", "code"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "rounded-control px-3 py-1 text-sm font-medium capitalize",
                tab === id
                  ? "bg-brand-primary-soft text-text-heading"
                  : "text-text-subtle hover:bg-surface-hover",
              )}
            >
              {id}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {tab === "preview" ? (
            <div role="group" aria-label="Viewport" className="flex gap-1">
              {viewports.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  aria-pressed={viewport === id}
                  title={label}
                  onClick={() => setViewport(id)}
                  className={cn(
                    "rounded-control p-1.5",
                    viewport === id
                      ? "bg-surface-muted text-text-heading"
                      : "text-text-muted hover:bg-surface-hover",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={copy}
            aria-label="Copy code"
            className="flex items-center gap-1 rounded-control px-2 py-1 text-xs text-text-subtle hover:bg-surface-hover"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="overflow-x-auto bg-surface-canvas p-6">
          <div
            className="mx-auto transition-[max-width] duration-200"
            style={{ maxWidth: width }}
            data-viewport={viewport}
          >
            <Component />
          </div>
        </div>
      ) : (
        <pre className="max-h-[32rem] overflow-auto bg-surface-muted p-4 font-mono text-[13px] leading-relaxed text-text-body">
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}
