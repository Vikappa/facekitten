import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: 'FaceKitten',
    short_name: 'FaceKitten',
    description: 'Facekitten web app',
    lang: "it-IT",
    start_url: '/',
    scope: "/",
    display: 'standalone',
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait",
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/img/facekittenlogo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: "maskable",
      },
      {
        src: '/img/facekittenlogo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: "maskable",
      },
    ],
  }
}
