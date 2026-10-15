import nextra from "nextra";

const withNextra = nextra({});

// Static export, so the site can be hosted on GitLab Pages. Set
// DOCS_BASE_PATH (e.g. "/kifiya-ui") when it is served from a sub-path.
const basePath = process.env.DOCS_BASE_PATH || undefined;

export default withNextra({
  output: "export",
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
});
