import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color — shown in browser tab and as status bar color */}
        <meta name="theme-color" content="#1a1a2e" />

        {/* iOS Safari PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ESPASYO" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
