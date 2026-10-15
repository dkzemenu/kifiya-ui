import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import nextra from "nextra";

const withNextra = nextra({});

// Static export, so the site can be hosted on GitLab Pages. Set
// DOCS_BASE_PATH (e.g. "/kifiya-ui") when it is served from a sub-path.
const basePath = process.env.DOCS_BASE_PATH || undefined;

export default function config(phase) {
  return withNextra({
    output: "export",
    basePath,
    images: { unoptimized: true },
    reactStrictMode: true,
    // The dev server gets its own folder, so a production build (`pnpm check`)
    // never overwrites the running dev server's output and breaks it.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  });
}
