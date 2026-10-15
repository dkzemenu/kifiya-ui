import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import { isScreen, planAdd } from "./add.js";
import { applyChanges, describeChanges, type FileChange } from "./changes.js";
import { diagnose } from "./doctor.js";
import { planInit } from "./init.js";
import { readProject } from "./project.js";
import { SCREENS } from "./templates.js";

const HELP = `kifiya-ui — set up and scaffold the Kifiya UI kit

Usage:
  kifiya-ui init   [--yes] [--css <path>]   Add the kit's styles, registry scope and provider
  kifiya-ui add <screen> [path] [--yes]     Create a starter screen (never overwrites)
  kifiya-ui doctor [--css <path>]           Check the app's kit setup

Screens:
${Object.entries(SCREENS)
  .map(([name, screen]) => `  ${name.padEnd(10)} ${screen.description}`)
  .join("\n")}

Every change is shown first and written only when you confirm (or pass --yes).
No command installs packages or writes a credential.`;

export interface Io {
  out: (text: string) => void;
  err: (text: string) => void;
  /** Resolves true when the user confirms. */
  confirm: (question: string) => Promise<boolean>;
  cwd: string;
}

async function confirmAndApply(
  io: Io,
  root: string,
  changes: FileChange[],
  yes: boolean,
) {
  if (changes.length === 0) {
    io.out("Nothing to change.");
    return 0;
  }
  io.out(describeChanges(changes));
  const ok =
    yes || (await io.confirm(`\nApply ${changes.length} change(s)? [y/N] `));
  if (!ok) {
    io.out("Nothing written.");
    return 0;
  }
  applyChanges(root, changes);
  io.out(`Done: ${changes.map((c) => c.path).join(", ")}`);
  return 0;
}

export async function run(argv: string[], io: Io): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      yes: { type: "boolean", short: "y", default: false },
      css: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const [command, ...rest] = positionals;

  if (values.help || !command) {
    io.out(HELP);
    return command || values.help ? 0 : 1;
  }

  try {
    const project = readProject(io.cwd, values.css);
    switch (command) {
      case "init": {
        const plan = planInit(project);
        const status = await confirmAndApply(
          io,
          io.cwd,
          plan.changes,
          values.yes,
        );
        for (const note of plan.notes) io.out(`\nNote: ${note}`);
        if (plan.commands.length)
          io.out(`\nThen run:\n  ${plan.commands.join("\n  ")}`);
        return status;
      }
      case "add": {
        const [screen, path] = rest;
        if (!screen || !isScreen(screen)) {
          io.err(
            `Unknown screen "${screen ?? ""}". Choose one of: ${Object.keys(SCREENS).join(", ")}.`,
          );
          return 1;
        }
        return confirmAndApply(
          io,
          io.cwd,
          [planAdd(project, screen, path)],
          values.yes,
        );
      }
      case "doctor": {
        const findings = diagnose(project);
        if (findings.length === 0) {
          io.out("The kit is set up correctly.");
          return 0;
        }
        for (const f of findings) io.out(`✗ ${f.problem}\n  ${f.fix}`);
        io.out(`\n${findings.length} problem(s) found.`);
        return 1;
      }
      default:
        io.err(`Unknown command "${command}".\n\n${HELP}`);
        return 1;
    }
  } catch (error) {
    io.err(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

/** Terminal I/O; without a terminal (CI), nothing is confirmed unless --yes. */
export function terminalIo(): Io {
  return {
    out: (text) => process.stdout.write(`${text}\n`),
    err: (text) => process.stderr.write(`${text}\n`),
    cwd: process.cwd(),
    confirm: async (question) => {
      if (!process.stdin.isTTY) {
        process.stdout.write(
          `${question}\nNot a terminal: pass --yes to apply.\n`,
        );
        return false;
      }
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      try {
        return /^y(es)?$/i.test((await rl.question(question)).trim());
      } finally {
        rl.close();
      }
    },
  };
}
