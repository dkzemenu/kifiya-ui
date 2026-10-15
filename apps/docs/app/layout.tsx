import type { Metadata } from "next";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import type { ReactNode } from "react";

import { DocsProviders } from "../components/docs-providers";
import "nextra-theme-docs/style-prefixed.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kifiya UI", template: "%s · Kifiya UI" },
  description:
    "Design tokens, React components, hooks and flows for Kifiya web apps.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={<Navbar logo={<b>Kifiya UI</b>} />}
          footer={<Footer>Kifiya UI kit · internal</Footer>}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://gitlab.kifiya.et/dilukefiya/kifiya-ui/-/tree/main/apps/docs"
          // The kit's dark mode is the `.dark` class on <html> (R-01 AC-01.2);
          // the theme switch must set exactly that (R-04 AC-04.2).
          nextThemes={{ attribute: "class", defaultTheme: "light" }}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          <DocsProviders>{children}</DocsProviders>
        </Layout>
      </body>
    </html>
  );
}
