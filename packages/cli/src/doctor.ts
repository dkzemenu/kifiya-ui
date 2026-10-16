import { STYLE_IMPORTS } from "./constants.js";
import { readIfExists } from "./changes.js";
import {
  installedKitVersions,
  installedTokenNames,
  sourcesMatching,
  type Project,
} from "./project.js";
import {
  checkStylesheet,
  requiredImports,
  tokenOverrides,
} from "./stylesheet.js";

export interface Finding {
  problem: string;
  fix: string;
  /** Reported, but does not fail `doctor`: it may be intentional. */
  warning?: boolean;
}

/** Everything `doctor` finds wrong with the app's kit setup (AC-05.4). */
export function diagnose(project: Project): Finding[] {
  const findings: Finding[] = [];

  if (!project.stylesheet) {
    findings.push({
      problem: "No global stylesheet found.",
      fix: "Run `kifiya-ui init`, or pass --css <path> if it lives elsewhere.",
    });
  } else {
    const css = readIfExists(project.root, project.stylesheet) ?? "";
    for (const issue of checkStylesheet(
      css,
      requiredImports(project.usesFlows),
    )) {
      findings.push(
        issue.kind === "missing"
          ? {
              problem: `${project.stylesheet} is missing ${issue.import}`,
              fix:
                issue.import === STYLE_IMPORTS.ui ||
                issue.import === STYLE_IMPORTS.flows
                  ? "Without it Tailwind never sees the kit's classes and components render unstyled. Run `kifiya-ui init`."
                  : "Run `kifiya-ui init`.",
            }
          : {
              problem: `${project.stylesheet} imports ${issue.import} out of order`,
              fix: "Order: tailwindcss, then @kifiya/tokens, @kifiya/ui, @kifiya/flows. Run `kifiya-ui init` to reorder.",
            },
      );
    }

    const overrides = tokenOverrides(css, installedTokenNames(project.root));
    if (overrides.length) {
      findings.push({
        warning: true,
        problem: `${project.stylesheet} redefines kit tokens: ${overrides
          .map((name) => `--${name}`)
          .join(", ")}`,
        fix: "These replace the kit's light and dark values (create-next-app's starter CSS does this). Delete them unless you mean to change the theme.",
      });
    }
  }

  const usesKit = sourcesMatching(
    project.root,
    /from ["']@kifiya\/(ui|flows)["']/,
  );
  if (
    usesKit.length &&
    sourcesMatching(project.root, /KifiyaUIProvider/).length === 0
  ) {
    findings.push({
      problem: "The kit is used but KifiyaUIProvider is not mounted.",
      fix: project.usesNext
        ? "Links render as plain <a> and skip the Next.js router. Run `kifiya-ui init` for a provider file."
        : "Run `kifiya-ui init` for a provider file.",
    });
  }

  const versions = installedKitVersions(project.root);
  const distinct = new Set(Object.values(versions));
  if (distinct.size > 1) {
    findings.push({
      problem: `Kit packages at mismatched versions: ${Object.entries(versions)
        .map(([name, version]) => `${name}@${version}`)
        .join(", ")}`,
      fix: "Install the same version of every @kifiya package; they are released together.",
    });
  }

  return findings;
}
