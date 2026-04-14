import type { NextConfig } from 'next'

// Pour générer un bundle statique (WebView) : `npm run build`
// → dossier `out/` prêt à être intégré dans .NET MAUI comme asset WebView.
// En dev (`npm run dev`) : serveur Next.js normal sur http://localhost:3001

const isExport = process.env.NEXT_EXPORT === 'true'

const nextConfig: NextConfig = {
  output: isExport ? 'export' : undefined,
  // Nécessaire pour export statique + Leaflet
  images: { unoptimized: true },
  // Pas de trailing slash en mode export pour compatibilité WebView
  trailingSlash: isExport ? false : undefined,
}

export default nextConfig
