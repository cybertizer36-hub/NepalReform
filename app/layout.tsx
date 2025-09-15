import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalreforms.com'),
  title: {
    default: "Nepal Reforms - 27 Comprehensive Reform Proposals for Democratic Transformation",
    template: "%s | Nepal Reforms",
  },
  description: "Explore 27 evidence-based reform proposals for Nepal's democratic transformation. Vote, discuss, and contribute to shaping Nepal's future through transparency, anti-corruption, and governance reforms.",
  keywords: [
    "Nepal reforms",
    "democratic transformation",
    "anti-corruption Nepal",
    "governance Nepal",
    "transparency Nepal",
    "CIAA reform",
    "electoral reform Nepal",
    "federalism Nepal",
    "digital governance",
    "Nepal manifesto",
    "Nepal youth movement",
  ],
  authors: [
    {
      name: "Nepal Reforms Platform",
      url: "https://nepalreforms.com",
    },
  ],
  creator: "Nexalaris Tech Company",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nepalreforms.com",
    title: "Nepal Reforms - 27 Reform Proposals",
    description: "Comprehensive reform proposals for Nepal's democratic transformation",
    siteName: "Nepal Reforms Platform",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nepal Reforms Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Reforms Platform",
    description: "27 comprehensive reform proposals for Nepal's democratic transformation",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  alternates: {
    canonical: "https://nepalreforms.com",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
