/**
 * `pnpm release`: publishes every package and tags the release, but only from
 * a state that can be released (D-009). It refuses, before anything is
 * built or published, when:
 *  - the working tree has uncommitted changes;
 *  - the branch is not `main`, or `main` differs from GitLab's `main`
 *    (an unmerged MR, or commits not pushed);
 *  - the packages are not all at the same version (they are released together);
 *  - that version is already tagged, or already in the registry;
 *  - GITLAB_NPM_TOKEN is not set in this shell.
 * Then it runs `pnpm check`, publishes, and only after every package is
 * published creates and pushes the `v<version>` tag.
 *
 * `pnpm release --dry-run` runs every check and `pnpm publish --dry-run`,
 * and creates no tag.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

function stop(message, hint) {
  console.error(`\n✗ ${message}`);
  if (hint) console.error(`  ${hint}`);
  console.error("\nNothing was published or tagged.");
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  return result.status === 0;
}

// 1. A clean tree on main, identical to GitLab's main.
if (git("status", "--porcelain")) {
  stop(
    "The working tree has uncommitted changes.",
    "Commit or stash them; a release must match a commit on main.",
  );
}
const branch = git("rev-parse", "--abbrev-ref", "HEAD");
if (branch !== "main") {
  stop(
    `You are on "${branch}", not main.`,
    "Merge the MR first, then: git switch main && git pull",
  );
}
git("fetch", "--quiet", "--tags", "origin", "main");
const local = git("rev-parse", "HEAD");
const remote = git("rev-parse", "origin/main");
if (local !== remote) {
  const behind = git("rev-list", "--count", `HEAD..origin/main`);
  const ahead = git("rev-list", "--count", `origin/main..HEAD`);
  stop(
    `Local main differs from GitLab's main (${behind} behind, ${ahead} ahead).`,
    Number(behind) > 0
      ? "Run git pull. If your release MR is not merged yet, merge it first."
      : "Your commits are not on GitLab's main; push a branch and merge it through an MR.",
  );
}

// 2. One version across every package.
const packages = readdirSync(join(root, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const pkg = JSON.parse(
      readFileSync(join(root, "packages", entry.name, "package.json"), "utf8"),
    );
    return { name: pkg.name, version: pkg.version, private: pkg.private };
  })
  .filter((pkg) => !pkg.private);
const versions = new Set(packages.map((pkg) => pkg.version));
if (versions.size !== 1) {
  stop(
    `The packages are at different versions: ${packages
      .map((pkg) => `${pkg.name}@${pkg.version}`)
      .join(", ")}`,
    "Bump every package to the same version; they are released together.",
  );
}
const version = [...versions][0];
const tag = `v${version}`;

// 3. Not released before.
if (git("tag", "--list", tag) || git("ls-remote", "--tags", "origin", tag)) {
  stop(
    `main is at ${version}, which is already released as ${tag}.`,
    "If you meant to release a newer version, its MR is probably not merged yet: merge it, then git pull. Otherwise bump the version in every package and CHANGELOG.md through an MR.",
  );
}

if (!process.env.GITLAB_NPM_TOKEN) {
  stop(
    "GITLAB_NPM_TOKEN is not set in this shell.",
    "Run: read -s GITLAB_NPM_TOKEN && export GITLAB_NPM_TOKEN   (paste the token, press Enter)",
  );
}

const published = packages.filter((pkg) => {
  const result = spawnSync(
    "npm",
    ["view", `${pkg.name}@${version}`, "version"],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status === 0) return result.stdout.trim() === version;
  if (/E404|404 Not Found/.test(result.stderr)) return false;
  stop(
    `Could not ask the registry about ${pkg.name}.`,
    /E401|ENEEDAUTH/.test(result.stderr)
      ? "The token was refused: it may have expired or lack the `api` scope."
      : result.stderr.trim().split("\n").slice(-2).join(" "),
  );
});
if (published.length === packages.length) {
  stop(
    `${version} is already published, every package.`,
    "Bump the version in every package and CHANGELOG.md, merge, and release again.",
  );
}
if (published.length) {
  // An earlier run failed part-way: pnpm skips what is already published.
  console.log(
    `Resuming ${version}: ${published.map((p) => p.name).join(", ")} already published.`,
  );
}

console.log(
  `Releasing ${version} from ${local.slice(0, 7)}: ${packages
    .map((pkg) => pkg.name)
    .join(", ")}${dryRun ? " (dry run)" : ""}\n`,
);

// 4. Check, publish, tag.
if (!run("pnpm", ["check"])) stop("pnpm check failed.");

const publishArgs = [
  "-r",
  "--filter",
  "./packages/*",
  "publish",
  "--no-git-checks",
];
if (dryRun) publishArgs.push("--dry-run");
if (!run("pnpm", publishArgs)) {
  console.error(
    "\n✗ Publishing failed. Packages published before the failure stay published;",
  );
  console.error(
    "  fix the cause and run pnpm release again: it publishes the rest and then tags.",
  );
  console.error("\nNo tag was created.");
  process.exit(1);
}

if (dryRun) {
  console.log(
    `\n✓ Dry run passed. A real run would publish ${version} and tag ${tag}.`,
  );
  process.exit(0);
}

git("tag", tag);
git("push", "origin", tag);
console.log(
  `\n✓ Published ${version} and pushed ${tag} (${local.slice(0, 7)}).`,
);
