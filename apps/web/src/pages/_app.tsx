import NProgress from 'nprogress';
import type { AppProps } from "next/app";
import { Router } from 'next/router';
import { PageLoaderContextProvider } from 'core-lib'
import { Suspense } from 'react';
import Head from 'next/head';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

if (typeof window !== 'undefined') {} //add analytics initialization here.

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const renderApp = () => {
    const baseApp = (children: React.ReactNode) => {
      return <PageLoaderContextProvider>{children}</PageLoaderContextProvider>
    }

    const content = (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...pageProps} />
      </Suspense>
    );

    return baseApp(content);    
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      {renderApp()}
    </>
  )
}

export default App;