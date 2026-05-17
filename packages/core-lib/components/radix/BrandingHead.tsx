import React, { useEffect } from "react";
import Head from "next/head";
import { usePublicSettings } from "../../core/contexts";

export const BrandingHead: React.FC = () => {
  const { systemName, theme } = usePublicSettings();

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (systemName && systemName.trim()) {
      document.title = systemName;
    }

    if (!theme.faviconUrl) return;

    const head = document.head;
    if (!head) return;

    let link = head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      head.appendChild(link);
    }
    if (link.href !== theme.faviconUrl) {
      link.href = theme.faviconUrl;
    }
  }, [systemName, theme.faviconUrl]);

  return (
    <Head>
      {systemName && systemName.trim() ? <title>{systemName}</title> : null}
      {theme.faviconUrl ? (
        <link rel="icon" href={theme.faviconUrl} />
      ) : null}
    </Head>
  );
};
