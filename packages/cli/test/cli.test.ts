import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { run, type Io } from "../src";
import { fixStylesheet, requiredImports } from "../src/stylesheet";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

/** A throwaway app with the given files. */
function app(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "kifiya-cli-"));
  dirs.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const nextApp = (extra: Record<string, string> = {}) =>
  app({
    "package.json": JSON.stringify({
      dependencies: { next: "15.5.0", react: "19.1.0" },
    }),
    "src/app/globals.css": '@import "tailwindcss";\n\nbody { margin: 0; }\n',
    "src/app/page.tsx": "export default function Page() { return null; }\n",
    ...extra,
  });

function io(root: string, answer: boolean) {
  const out: string[] = [];
  const err: string[] = [];
  const confirm = vi.fn(async () => answer);
  const value: Io = {
    out: (t) => out.push(t),
    err: (t) => err.push(t),
    confirm,
    cwd: root,
  };
  return { io: value, out, err, confirm, text: () => out.join("\n") };
}

/** Every file under root (relative path → contents), for before/after comparison. */
function snapshot(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else files[path.slice(root.length + 1)] = readFileSync(path, "utf8");
    }
  };
  walk(root);
  return files;
}

describe("R-05 kifiya-ui CLI", () => {
  it("AC-05.1 init shows every change and writes nothing until confirmed", async () => {
    const root = nextApp();
    const before = snapshot(root);
    const t = io(root, false);

    expect(await run(["init"], t.io)).toBe(0);

    expect(t.confirm).toHaveBeenCalledTimes(1);
    expect(t.text()).toContain("update src/app/globals.css");
    expect(t.text()).toContain('+ @import "@kifiya/tokens/tailwind.css";');
    expect(t.text()).toContain("create .npmrc");
    expect(t.text()).toContain("create src/components/kifiya-providers.tsx");
    expect(t.text()).toContain("Nothing written.");
    expect(snapshot(root)).toEqual(before);
  });

  it("AC-05.1 init does not install packages; it prints the command", async () => {
    const t = io(nextApp(), false);
    await run(["init"], t.io);
    expect(t.text()).toContain("pnpm add @kifiya/tokens @kifiya/ui");
  });

  describe("AC-05.2 the stylesheet gets the imports in order, and init is idempotent", () => {
    it("applies on confirm, and a second run changes nothing", async () => {
      const root = nextApp();
      await run(["init"], io(root, true).io);

      const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
      expect(css.split("\n").slice(0, 3)).toEqual([
        '@import "tailwindcss";',
        '@import "@kifiya/tokens/tailwind.css";',
        '@import "@kifiya/ui/styles.css";',
      ]);
      expect(css).toContain("body { margin: 0; }");

      const after = snapshot(root);
      const second = io(root, true);
      await run(["init"], second.io);
      expect(second.text()).toContain("Nothing to change.");
      expect(second.confirm).not.toHaveBeenCalled();
      expect(snapshot(root)).toEqual(after);
    });

    it("reorders misordered imports and adds the flows' styles when the app uses flows", () => {
      const css = [
        '@import "@kifiya/ui/styles.css";',
        '@import "tailwindcss";',
        "@import './fonts.css';",
        '@import "@kifiya/tokens/tailwind.css";',
      ].join("\n");
      const fixed = fixStylesheet(css, requiredImports(true));
      expect(fixed.split("\n")).toEqual([
        '@import "tailwindcss";',
        '@import "@kifiya/tokens/tailwind.css";',
        '@import "@kifiya/ui/styles.css";',
        '@import "@kifiya/flows/styles.css";',
        "@import './fonts.css';",
      ]);
      expect(fixStylesheet(fixed, requiredImports(true))).toBe(fixed);
    });
  });

  describe("AC-05.3 add creates a starter screen and never overwrites", () => {
    it.each(["sign-in", "app-shell", "list-page"])(
      "creates %s at the given path",
      async (screen) => {
        const root = nextApp();
        const t = io(root, true);
        expect(
          await run(["add", screen, "src/screens/example.tsx"], t.io),
        ).toBe(0);
        const file = readFileSync(
          join(root, "src/screens/example.tsx"),
          "utf8",
        );
        expect(file).toContain('from "@kifiya/flows"');
      },
    );

    it("refuses an existing file and leaves it untouched", async () => {
      const root = nextApp({ "src/screens/example.tsx": "// mine\n" });
      const t = io(root, true);
      expect(
        await run(["add", "sign-in", "src/screens/example.tsx"], t.io),
      ).toBe(1);
      expect(t.err.join("\n")).toContain("never overwrites");
      expect(readFileSync(join(root, "src/screens/example.tsx"), "utf8")).toBe(
        "// mine\n",
      );
    });

    it("rejects an unknown screen", async () => {
      const t = io(nextApp(), true);
      expect(await run(["add", "dashboard"], t.io)).toBe(1);
      expect(t.err.join("\n")).toContain("sign-in, app-shell, list-page");
    });
  });

  describe("AC-05.4 doctor reports each problem and fails when it finds any", () => {
    it("reports a missing import, a missing provider and mismatched versions", async () => {
      const root = nextApp({
        "src/app/page.tsx": 'import { PortalButton } from "@kifiya/ui";\n',
        "node_modules/@kifiya/tokens/package.json": JSON.stringify({
          version: "0.1.0",
        }),
        "node_modules/@kifiya/ui/package.json": JSON.stringify({
          version: "0.2.0",
        }),
      });
      writeFileSync(
        join(root, "src/app/globals.css"),
        '@import "tailwindcss";\n@import "@kifiya/tokens/tailwind.css";\n',
      );
      const t = io(root, false);

      expect(await run(["doctor"], t.io)).toBe(1);
      expect(t.text()).toContain('missing @import "@kifiya/ui/styles.css";');
      expect(t.text()).toContain("render unstyled");
      expect(t.text()).toContain("KifiyaUIProvider is not mounted");
      expect(t.text()).toContain("@kifiya/tokens@0.1.0, @kifiya/ui@0.2.0");
    });

    it("reports imports out of order", async () => {
      const root = nextApp();
      writeFileSync(
        join(root, "src/app/globals.css"),
        '@import "tailwindcss";\n@import "@kifiya/ui/styles.css";\n@import "@kifiya/tokens/tailwind.css";\n',
      );
      const t = io(root, false);
      expect(await run(["doctor"], t.io)).toBe(1);
      expect(t.text()).toContain("out of order");
    });

    it("warns, without failing, when the stylesheet redefines kit tokens", async () => {
      const root = nextApp({
        "node_modules/@kifiya/tokens/dist/tokens.json": JSON.stringify({
          themes: [
            {
              base: { radius: "1rem" },
              light: { background: "#fff", foreground: "#000" },
            },
          ],
        }),
      });
      await run(["init"], io(root, true).io);
      const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
      writeFileSync(
        join(root, "src/app/globals.css"),
        `${css}\n:root {\n  --background: #ffffff;\n  --foreground: #171717;\n  --my-own: 1px;\n}\n/* --radius: 0; */\n`,
      );
      const t = io(root, false);
      expect(await run(["doctor"], t.io)).toBe(0);
      expect(t.text()).toContain(
        "redefines kit tokens: --background, --foreground",
      );
      expect(t.text()).not.toContain("--my-own");
      expect(t.text()).not.toContain("--radius");
      expect(t.text()).toContain("with the warning(s) above");
    });

    it("passes an app that init has set up", async () => {
      const root = nextApp();
      await run(["init"], io(root, true).io);
      const t = io(root, false);
      expect(await run(["doctor"], t.io)).toBe(0);
      expect(t.text()).toContain("set up correctly");
    });
  });

  it("AC-05.5 no command writes a credential or token", async () => {
    const root = nextApp({ ".npmrc": "save-exact=true\n" });
    await run(["init"], io(root, true).io);
    for (const screen of ["sign-in", "app-shell", "list-page"]) {
      await run(
        ["add", screen, `src/screens/${screen}.tsx`],
        io(root, true).io,
      );
    }
    const npmrc = readFileSync(join(root, ".npmrc"), "utf8");
    expect(npmrc).toContain("save-exact=true");
    expect(npmrc).toContain("@kifiya:registry=");
    for (const [path, content] of Object.entries(snapshot(root))) {
      expect(content, path).not.toMatch(
        /_authToken|glpat-|\bpassword\s*=\s*["'][^"']+["']|Bearer\s+\w/i,
      );
    }
  });

  it("without --yes and without a terminal, nothing is applied", async () => {
    const root = nextApp();
    const before = snapshot(root);
    await run(["add", "sign-in"], io(root, false).io);
    expect(snapshot(root)).toEqual(before);
  });
});
