import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalreforms.com'

  // Get current date for lastModified
  const currentDate = new Date()

  // Load manifesto data from JSON file
  let manifestoData: any[] = []
  try {
    const summaryPath = path.join(process.cwd(), 'public', 'locales', 'en', 'summary.json')
    const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'))
    manifestoData = summaryData.manifestoData || []
  } catch (error) {
    console.error('Error loading manifesto data for sitemap:', error)
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/opinions`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
  
  // Generate agenda pages dynamically from manifestoData
  const agendaPages: MetadataRoute.Sitemap = manifestoData.map((item) => ({
    url: `${baseUrl}/agenda/${item.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))
  
  // Combine all pages
  return [...staticPages, ...agendaPages]
}
