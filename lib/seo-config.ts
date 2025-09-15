import { Metadata } from 'next'

// Base metadata configuration for the entire site
export const siteConfig = {
  name: 'Nepal Reforms Platform',
  title: 'Nepal Reforms - 27 Comprehensive Reform Proposals for Democratic Transformation',
  description: 'Explore 27 evidence-based reform proposals for Nepal\'s democratic transformation. Vote, discuss, and contribute to shaping Nepal\'s future through transparency, anti-corruption, and governance reforms.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalreforms.com',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/nepalreforms',
    github: 'https://github.com/nepalreforms',
  },
  keywords: [
    'Nepal reforms',
    'democratic transformation',
    'anti-corruption Nepal',
    'governance Nepal',
    'transparency Nepal',
    'CIAA reform',
    'electoral reform Nepal',
    'federalism Nepal',
    'digital governance',
    'public administration',
    'Nepal manifesto',
    'Nepal youth movement',
    'Nepal protests 2024',
    'Nepal political reform',
  ],
  authors: [
    {
      name: 'Nepal Reforms Platform',
      url: 'https://nepalreforms.com',
    },
  ],
  creator: 'Nexalaris Tech Company',
}

// Default metadata export for Next.js
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@nepalreforms',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: siteConfig.url,
    types: {
      'application/rss+xml': `${siteConfig.url}/feed.xml`,
    },
  },
}

// Category-specific metadata
export const categoryMetadata: Record<string, Metadata> = {
  'anti-corruption': {
    title: 'Anti-Corruption Reforms',
    description: 'Comprehensive anti-corruption reforms including CIAA independence, asset disclosure, and transparency measures for Nepal.',
    keywords: ['CIAA reform', 'anti-corruption Nepal', 'asset disclosure', 'transparency'],
  },
  'electoral-reform': {
    title: 'Electoral Reforms',
    description: 'Electoral system reforms including fresh elections, NOTA option, and campaign finance transparency for Nepal.',
    keywords: ['electoral reform Nepal', 'NOTA Nepal', 'campaign finance', 'fresh elections'],
  },
  'governance': {
    title: 'Governance Reforms',
    description: 'Governance improvements including ministerial qualifications, civil service reform, and administrative efficiency.',
    keywords: ['governance Nepal', 'civil service reform', 'ministerial qualifications'],
  },
  'digital-governance': {
    title: 'Digital Governance',
    description: 'Digital transformation of government services, online platforms, and e-governance initiatives for Nepal.',
    keywords: ['digital Nepal', 'e-governance', 'online services', 'digital transformation'],
  },
  'healthcare': {
    title: 'Healthcare Reforms',
    description: 'Universal healthcare coverage, rural health infrastructure, and health system transformation for Nepal.',
    keywords: ['healthcare Nepal', 'universal coverage', 'rural health', 'health reform'],
  },
  'education': {
    title: 'Education Reforms',
    description: 'Education system transformation including quality improvement, access expansion, and curriculum reform.',
    keywords: ['education reform Nepal', 'quality education', 'curriculum reform', 'student politics'],
  },
}

// Generate metadata for individual agenda pages
export function generateAgendaMetadata(item: any): Metadata {
  return {
    title: `Reform #${item.id}: ${item.title}`,
    description: item.description,
    keywords: [
      item.category,
      `${item.priority} priority`,
      'Nepal reform',
      ...item.title.toLowerCase().split(' '),
    ],
    openGraph: {
      title: `Reform #${item.id}: ${item.title}`,
      description: item.description,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['Nepal Reforms Platform'],
      tags: [item.category, item.priority, 'Nepal', 'Reform'],
    },
  }
}
