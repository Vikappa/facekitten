import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FaceKitten',
    short_name: 'Fk',
    description: 'Facekitten web app',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/img/facekittenlogo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/img/facekittenlogo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}