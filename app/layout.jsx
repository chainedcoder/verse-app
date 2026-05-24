import "./globals.css"
import Nav from "@/components/Nav"
import ThemePanel from "@/components/ThemePanel"
import { Providers } from "@/components/Providers"

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
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var theme = localStorage.getItem('verse_theme');
              var accent = localStorage.getItem('verse_accent');
              if (theme) document.documentElement.setAttribute('data-theme', theme);
              if (accent) document.documentElement.setAttribute('data-accent', accent);
            } catch (e) {}
          `
        }} />
      </head>
      <body>
        <Providers>
          <div id="app">
            <Nav />
            <ThemePanel />
            <main id="main-content" className="page-enter">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
