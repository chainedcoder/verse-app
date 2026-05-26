// Root layout for the embed route group — standalone, no app shell
// Using a route group (embed) gives this its own root layout that
// replaces app/layout.jsx for all routes under (embed)/*

export const metadata = {
  robots: { index: false },
}

export default function EmbedRootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#fafaf9", fontFamily: "Inter, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
