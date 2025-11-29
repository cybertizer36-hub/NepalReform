// Enhanced sitemap with more options and better SEO
import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

// Types for better type safety
type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface SitemapEntry {
  url: string
  lastModified: Date
  changeFrequency: ChangeFrequency
  priority: number
}

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

  // Helper function to create sitemap entry
  const createEntry = (
    path: string, 
    changeFreq: ChangeFrequency = 'weekly', 
    priority: number = 0.5,
    lastMod: Date = currentDate
  ): SitemapEntry => ({
    url: `${baseUrl}${path}`,
    lastModified: lastMod,
    changeFrequency: changeFreq,
    priority,
  })
  
  // Core pages with highest priority
  const corePages: SitemapEntry[] = [
    createEntry('', 'daily', 1.0), // Homepage
    createEntry('/#agendas-section', 'daily', 0.95), // Agendas section
  ]
  
  // All 27 reform agenda pages - Very important for SEO
  const agendaPages: SitemapEntry[] = manifestoData.map((item) => {
    // Higher priority for High priority reforms
    const priority = item.priority === 'High' ? 0.9 : item.priority === 'Medium' ? 0.85 : 0.8
    
    return createEntry(
      `/agenda/${item.id}`,
      'weekly',
      priority
    )
  })
  
  // Category pages (if you have them in the future)
  const categories = [...new Set(manifestoData.map((item: any) => item.category))]
  const categoryPages: SitemapEntry[] = categories.map((category) => 
    createEntry(
      `/category/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`,
      'weekly',
      0.7
    )
  ).filter(() => false) // Disable for now since these pages don't exist yet
  
  // Community and engagement pages
  const communityPages: SitemapEntry[] = [
    createEntry('/opinions', 'daily', 0.8),
    createEntry('/create-opinion', 'monthly', 0.5),
  ]
  
  // Authentication pages (lower priority)
  const authPages: SitemapEntry[] = [
    createEntry('/auth/login', 'monthly', 0.3),
    createEntry('/auth/signup', 'monthly', 0.3),
    createEntry('/auth/forgot-password', 'yearly', 0.2),
  ]
  
  // Legal and policy pages (if they exist)
  const legalPages: SitemapEntry[] = [
    createEntry('/privacy-policy', 'yearly', 0.4),
    createEntry('/terms-of-service', 'yearly', 0.4),
    createEntry('/about', 'monthly', 0.6),
    createEntry('/contact', 'monthly', 0.5),
  ].filter(() => false) // Disable for now since these pages might not exist yet
  
  // Combine all pages
  const allPages: SitemapEntry[] = [
    ...corePages,
    ...agendaPages,
    ...categoryPages,
    ...communityPages,
    ...authPages,
    ...legalPages,
  ]
  
  // Sort by priority (highest first) for better crawling
  return allPages.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}
