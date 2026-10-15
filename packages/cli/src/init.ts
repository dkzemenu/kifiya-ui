import { join } from "node:path";

import { readIfExists, type FileChange } from "./changes.js";
import {
  KIT_PACKAGES,
  SCOPE_LINE,
  STYLESHEET_CANDIDATES,
} from "./constants.js";
import type { Project } from "./project.js";
import { sourcesMatching } from "./project.js";
import { fixStylesheet, requiredImports } from "./stylesheet.js";
import { providersTemplate } from "./templates.js";

export interface InitPlan {
  changes: FileChange[];
  /** Commands for the developer to run; `init` never runs them (D-013). */
  commands: string[];
  notes: string[];
}

/** What `init` would change. Pure: reads the project, writes nothing. */
export function planInit(project: Project): InitPlan {
  const changes: FileChange[] = [];
  const notes: string[] = [];

  // 1. Stylesheet imports.
  const stylesheet =
    project.stylesheet ??
    (project.srcDir ? "src/app/globals.css" : "app/globals.css");
  const css = readIfExists(project.root, stylesheet);
  const fixed = fixStylesheet(css ?? "", requiredImports(project.usesFlows));
  if (css === null || fixed !== css) {
    changes.push({
      path: stylesheet,
      before: css,
      after: css === null ? `${fixed.trim()}\n` : fixed,
      why: "Tailwind and the kit's styles, in order",
    });
  }
  if (!project.stylesheet) {
    notes.push(
      `No global stylesheet found (looked for ${STYLESHEET_CANDIDATES.join(", ")}). ` +
        `Creating ${stylesheet}; import it from your root layout, or pass --css <path>.`,
    );
  }

  // 2. The registry scope line. Never a token (AC-05.5).
  const npmrc = readIfExists(project.root, ".npmrc");
  if (
    !npmrc
      ?.split("\n")
      .some((line) => line.trim().startsWith("@kifiya:registry="))
  ) {
    const base = npmrc && !npmrc.endsWith("\n") ? `${npmrc}\n` : (npmrc ?? "");
    changes.push({
      path: ".npmrc",
      before: npmrc,
      after: `${base}${SCOPE_LINE}\n`,
      why: "where @kifiya packages come from",
    });
    notes.push(
      "Your registry token is not written anywhere. Put it in your user ~/.npmrc " +
        "or your CI's secret variables (see the kit's Installation guide).",
    );
  }

  // 3. A provider file, unless the app already uses the provider.
  const hasProvider =
    sourcesMatching(project.root, /KifiyaUIProvider/).length > 0;
  if (!hasProvider) {
    const path = join(project.srcDir, "components", "kifiya-providers.tsx");
    if (readIfExists(project.root, path) === null) {
      changes.push({
        path,
        before: null,
        after: providersTemplate(project.usesNext),
        why: "app-wide provider, toasts and tooltips",
      });
      notes.push(
        `Wrap your root layout's children in <KifiyaProviders> from ${path}.`,
      );
    }
  }

  const missing = ["@kifiya/tokens", "@kifiya/ui"].filter(
    (name) => !(name in project.dependencies),
  );
  const commands = missing.length ? [`pnpm add ${missing.join(" ")}`] : [];
  if (!project.usesFlows) {
    notes.push(
      `Add ${KIT_PACKAGES.filter((n) => n === "@kifiya/hooks" || n === "@kifiya/flows").join(" and ")} ` +
        "if you use the flows, then run init again to add their styles.",
    );
  }

  return { changes, commands, notes };
}
