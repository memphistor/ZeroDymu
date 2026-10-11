import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * GitHub Pages serves this repo from a project subpath, so every absolute URL
 * in the document must include it. Keep this in sync with
 * `expo.experiments.baseUrl` in app.json.
 */
const BASE = '/ZeroDymu';

/**
 * Custom document shell for the web build. Web only — never rendered on native.
 *
 * Besides the usual reset it turns the web build into an installable PWA, so
 * the app can be added to the iPhone home screen and launched full screen
 * without browser chrome — which is what makes it usable as a real app.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* `viewport-fit=cover` + the safe-area CSS below let the app draw under
            the notch and home indicator, like the native build does. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="description" content="Rzucaj palenie małymi krokami. Bez presji, dzień po dniu." />

        {/* iOS: launch from the home screen as a standalone app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zero Dymu" />
        <meta name="format-detection" content="telephone=no" />

        <link rel="manifest" href={`${BASE}/manifest.json`} />
        <link rel="icon" href={`${BASE}/favicon.png`} />
        <link rel="apple-touch-icon" href={`${BASE}/apple-touch-icon.png`} />

        <title>Zero Dymu</title>

        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                height: 100%;
                background-color: #FFFFFF;
              }
              /* Stop iOS Safari from bouncing the whole page and from
                 rubber-banding the app shell. */
              body {
                margin: 0;
                overscroll-behavior: none;
                -webkit-tap-highlight-color: transparent;
                -webkit-font-smoothing: antialiased;
                text-rendering: optimizeLegibility;
              }
              /* Safe-area padding is handled per-screen in the app, so the app
                 shell itself must not add any. */
              #root {
                display: flex;
                flex-direction: column;
              }
              /* Hide the scrollbar on desktop without losing scrollability. */
              ::-webkit-scrollbar { width: 0; height: 0; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
