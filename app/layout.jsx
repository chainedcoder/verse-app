import "./globals.css"
import Nav from "@/components/Nav"
import ThemePanel from "@/components/ThemePanel"
import { Providers } from "@/components/Providers"
import { ToastProvider } from "@/components/ToastProvider"
import ErrorBoundary from "@/components/ErrorBoundary"
import { WebVitals } from "@/components/WebVitals"
import Script from "next/script"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata = {
  title: "Verse — Poetry & Lyrics",
  description: "Discover, share, and download beautiful poetry and lyrics.",
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-accent="indigo" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('verse_theme');
                var accent = localStorage.getItem('verse_accent');
                if (theme) document.documentElement.setAttribute('data-theme', theme);
                if (accent) document.documentElement.setAttribute('data-accent', accent);
              } catch (e) {}
            `
          }}
        />
        {/* Service Worker registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `
          }}
        />
        {/* Google Analytics — activates only when NEXT_PUBLIC_GA_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { page_path: window.location.pathname });
                `
              }}
            />
          </>
        )}
      </head>
      <body>
        <Providers>
          <ToastProvider>
            <WebVitals />
            <div id="app">
              <Nav />
              <ThemePanel />
              <main id="main-content" className="page-enter" role="main">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}

