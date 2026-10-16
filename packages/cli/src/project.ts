import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { KIT_PACKAGES, STYLESHEET_CANDIDATES } from "./constants.js";

export interface Project {
  root: string;
  dependencies: Record<string, string>;
  usesNext: boolean;
  usesFlows: boolean;
  /** Relative path of the global stylesheet, if one was found. */
  stylesheet?: string;
  /** "src" when the app keeps its code under src/, otherwise "". */
  srcDir: string;
}

export function readProject(
  root: string,
  stylesheetOverride?: string,
): Project {
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(
      `No package.json in ${root}. Run this from your app's folder.`,
    );
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const dependencies = { ...pkg.devDependencies, ...pkg.dependencies };
  const stylesheet =
    stylesheetOverride ??
    STYLESHEET_CANDIDATES.find((candidate) =>
      existsSync(join(root, candidate)),
    );
  return {
    root,
    dependencies,
    usesNext: "next" in dependencies,
    usesFlows: "@kifiya/flows" in dependencies,
    stylesheet,
    srcDir: existsSync(join(root, "src")) ? "src" : "",
  };
}

/** Installed versions of the kit's packages, from node_modules. */
export function installedKitVersions(root: string): Record<string, string> {
  const versions: Record<string, string> = {};
  for (const name of KIT_PACKAGES) {
    const path = join(root, "node_modules", name, "package.json");
    if (existsSync(path)) {
      versions[name] = (
        JSON.parse(readFileSync(path, "utf8")) as { version: string }
      ).version;
    }
  }
  return versions;
}

/**
 * Every token name the installed @kifiya/tokens defines (e.g. "background",
 * "brand-primary"), from its tokens.json; empty when it is not installed.
 */
export function installedTokenNames(root: string): string[] {
  const path = join(
    root,
    "node_modules",
    "@kifiya",
    "tokens",
    "dist",
    "tokens.json",
  );
  if (!existsSync(path)) return [];
  const { themes } = JSON.parse(readFileSync(path, "utf8")) as {
    themes: { base: Record<string, string>; light: Record<string, string> }[];
  };
  const theme = themes[0];
  return theme ? [...Object.keys(theme.base), ...Object.keys(theme.light)] : [];
}

const SOURCE = /\.(tsx?|jsx?)$/;
const SKIP = new Set([
  "node_modules",
  ".next",
  ".next-dev",
  "dist",
  "out",
  ".git",
  "build",
  "coverage",
]);

/** Source files (relative paths) whose text matches `pattern`. */
export function sourcesMatching(root: string, pattern: RegExp): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name)) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (SOURCE.test(name) && pattern.test(readFileSync(path, "utf8"))) {
        found.push(relative(root, path));
      }
    }
  };
  walk(root);
  return found;
}
