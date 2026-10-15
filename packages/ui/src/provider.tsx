"use client";

import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
  type Ref,
} from "react";

export type KifiyaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
};

/** Any component that renders a link from `href`, e.g. Next.js `Link`. */
export type KifiyaLinkComponent = ComponentType<KifiyaLinkProps>;

function DefaultLink(props: KifiyaLinkProps) {
  return <a {...props} />;
}

const LinkComponentContext = createContext<KifiyaLinkComponent>(DefaultLink);

export interface KifiyaUIProviderProps {
  /**
   * The app's router link, used by every kit component that navigates
   * (`PortalButton` with `href`, `PortalSidebarNavItem`). Defaults to `<a>`.
   */
  linkComponent?: KifiyaLinkComponent;
  children: ReactNode;
}

/**
 * Optional app-wide settings for the kit. The kit imports no router: apps on
 * Next.js pass `linkComponent={Link}` here; other apps can omit the provider.
 */
export function KifiyaUIProvider({
  linkComponent = DefaultLink,
  children,
}: KifiyaUIProviderProps) {
  return (
    <LinkComponentContext.Provider value={linkComponent}>
      {children}
    </LinkComponentContext.Provider>
  );
}

export function useLinkComponent(): KifiyaLinkComponent {
  return useContext(LinkComponentContext);
}
