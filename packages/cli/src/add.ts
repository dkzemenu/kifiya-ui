import { join } from "node:path";

import { readIfExists, type FileChange } from "./changes.js";
import type { Project } from "./project.js";
import { SCREENS, type ScreenName } from "./templates.js";

export function isScreen(name: string): name is ScreenName {
  return name in SCREENS;
}

/**
 * The file `add` would create. Throws if it already exists: `add` never
 * overwrites (AC-05.3).
 */
export function planAdd(
  project: Project,
  screen: ScreenName,
  path?: string,
): FileChange {
  const target =
    path ?? join(project.srcDir, "components", SCREENS[screen].file);
  if (readIfExists(project.root, target) !== null) {
    throw new Error(
      `${target} already exists. Choose another path; add never overwrites a file.`,
    );
  }
  return {
    path: target,
    before: null,
    after: SCREENS[screen].source,
    why: SCREENS[screen].description,
  };
}
