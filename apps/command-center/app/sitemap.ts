import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-07-22')

  return [
    { url: 'https://leadshield.live/', lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://leadshield.live/missed-call-text-back', lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://leadshield.live/privacy', lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
