import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import { Callout } from "nextra/components";
import type { MDXComponents } from "nextra/mdx-components";

import { Example } from "./components/example";
import { TokenGallery } from "./components/token-gallery";

const themeComponents = getThemeComponents();

export function useMDXComponents(components?: MDXComponents) {
  return {
    ...themeComponents,
    Callout,
    Example,
    TokenGallery,
    ...components,
  };
}
