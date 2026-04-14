import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Map Services — Covoiturage La Cité',
  description: 'WebView map service — circuit display for mobile app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" style={{ height: '100%' }} suppressHydrationWarning>
      <head>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body style={{ height: '100%', margin: 0, padding: 0, overflow: 'hidden' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
