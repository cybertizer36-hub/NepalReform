import Script from 'next/script'

interface StructuredDataProps {
  data: any
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

// Organization schema for the main site
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Nepal Reforms Platform',
  url: 'https://nepalreforms.com',
  logo: 'https://nepalreforms.com/logo.png',
  description: 'A platform for democratic participation in Nepal\'s reform process',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NP',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Nepal',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'suggestions@nepalreforms.com',
    contactType: 'customer support',
  },
}

// Website schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Nepal Reforms Platform',
  url: 'https://nepalreforms.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://nepalreforms.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

// Generate article schema for reform pages
export function generateArticleSchema(item: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Reform #${item.id}: ${item.title}`,
    description: item.description,
    author: {
      '@type': 'Organization',
      name: 'Nepal Reforms Platform',
      url: 'https://nepalreforms.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nepal Reforms Platform',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nepalreforms.com/logo.png',
      },
    },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nepalreforms.com/agenda/${item.id}`,
    },
    keywords: [item.category, item.priority, 'Nepal', 'Reform', 'Democracy'],
    articleSection: item.category,
    wordCount: item.description.length + (item.problem?.short?.length || 0) + (item.problem?.long?.length || 0),
  }
}

// FAQ schema for common questions
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Nepal Reforms Platform?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Nepal Reforms Platform presents 27 comprehensive reform proposals for Nepal\'s democratic transformation, allowing citizens to vote, discuss, and contribute to shaping Nepal\'s future.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I participate in the reform process?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can participate by reading the reform agendas, voting on proposals, signing in to submit suggestions, and sharing the platform with others. You can also email feedback to suggestions@nepalreforms.com.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the reforms based on evidence?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, each reform proposal includes real-world evidence from other countries, detailed implementation timelines, and specific performance targets based on international best practices.',
      },
    },
  ],
}

// Breadcrumb schema generator
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
