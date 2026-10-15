import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface FileChange {
  /** Relative to the project root. */
  path: string;
  /** Current contents; `null` when the file is created. */
  before: string | null;
  after: string;
  why: string;
}

export function readIfExists(root: string, path: string): string | null {
  const full = join(root, path);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

/** A readable summary of the changes: added and removed lines per file. */
export function describeChanges(changes: FileChange[]): string {
  return changes
    .map((change) => {
      const header = `${change.before === null ? "create" : "update"} ${change.path}  (${change.why})`;
      const before = new Set((change.before ?? "").split("\n"));
      const after = new Set(change.after.split("\n"));
      const added = change.after
        .split("\n")
        .filter((l) => !before.has(l) && l.trim());
      const removed = (change.before ?? "")
        .split("\n")
        .filter((l) => !after.has(l) && l.trim());
      const shown = change.before === null ? added.slice(0, 6) : added;
      const more =
        change.before === null && added.length > 6
          ? [`  … ${added.length - 6} more lines`]
          : [];
      return [
        header,
        ...removed.map((l) => `  - ${l}`),
        ...shown.map((l) => `  + ${l}`),
        ...more,
      ].join("\n");
    })
    .join("\n\n");
}

export function applyChanges(root: string, changes: FileChange[]): void {
  for (const change of changes) {
    const full = join(root, change.path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, change.after);
  }
}
