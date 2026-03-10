import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "../styles/globals.css";
// import "../styles/mui.css";
import { CacheProvider } from "@emotion/react";
import NProgress from "nprogress";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import React, { ReactElement, ReactNode, Suspense } from "react";
import Head from "next/head";
import { NextPage } from "next";
import { useEmotionCache } from "core-lib/core/hooks";
import Page from "@/components/shared/Page";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

if (typeof window !== "undefined") {
} //add analytics init

export type NextPageWithLayout<P = any, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const cache = useEmotionCache();

  const getLayout = Component.getLayout ?? ((page) => page);
  const renderApp = () => {
    const baseApp = (children: React.ReactNode) => {
      return <>{children}</>;
    };

    const content = (
      <Suspense fallback={<div>Loading...</div>}>
        {getLayout(<Component {...pageProps} />)}
      </Suspense>
    );

    return baseApp(content);
  };

  return (
    <CacheProvider value={cache}>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Page>{renderApp()}</Page>
    </CacheProvider>
  );
}
