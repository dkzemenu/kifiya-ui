"use client";

import { tokenNames } from "@kifiya/tokens";
import { useEffect, useState, type CSSProperties } from "react";

const groups: Array<[string, RegExp]> = [
  ["Brand", /^brand-/],
  ["Surfaces", /^surface-/],
  ["Text", /^text-/],
  ["Borders", /^border-/],
  ["Status", /^status-/],
  ["Charts", /^chart-/],
];

/** Every colour token, with its value in the current mode. */
export function TokenGallery() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      setValues(
        Object.fromEntries(
          tokenNames.map((n) => [n, styles.getPropertyValue(`--${n}`).trim()]),
        ),
      );
    };
    read();
    // Re-read when the theme switch toggles `.dark`.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="not-prose mt-4 space-y-8">
      {groups.map(([title, pattern]) => (
        <section key={title}>
          <h3 className="mb-3 text-sm font-semibold text-text-heading">
            {title}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tokenNames
              .filter((n) => pattern.test(n))
              .map((name) => (
                <div key={name} className="k-card border p-3">
                  <div
                    className="h-12 rounded-control border border-border-soft bg-(--swatch)"
                    style={{ "--swatch": `var(--${name})` } as CSSProperties}
                  />
                  <div className="mt-2 font-mono text-xs text-text-strong">
                    {name}
                  </div>
                  <div className="truncate font-mono text-xs text-text-muted">
                    {values[name] ?? ""}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
