import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trade Fortress Command Center',
    short_name: 'Trade Fortress',
    description:
      'Missed-call text-back, leads, jobs, and commercial paperwork for trade-service businesses.',
    start_url: '/crm',
    display: 'standalone',
    background_color: '#050814',
    theme_color: '#173F6B',
    icons: [
      {
        src: '/trade-fortress-logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
    ],
  }
}
