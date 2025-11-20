import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better hydration debugging
  reactStrictMode: true,
  // Enable production source maps for easier error tracing in prod
  productionBrowserSourceMaps: true,
  // Use default server output to avoid Windows symlink issues during standalone tracing

  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nepalreforms.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'nokrhvgrfcletinhsalt.supabase.co',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  experimental: {
    optimizePackageImports: [
      'recharts',
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },
  
  webpack: (config, { isServer, dev }) => {
    // Optimize recharts imports for better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      'recharts/es6': 'recharts/lib',
    }
    
    // Enable better tree shaking for lucide-react
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    // Production-only optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
      }
    }
    
    return config
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalreforms.com',
  },

  async headers() {
    const isProd = process.env.NODE_ENV === 'production'

    // Build a safer CSP. Keep 'unsafe-eval' only in development to avoid breaking Next dev tools.
    const scriptSrc = isProd
      ? "'self' 'unsafe-inline'"
      : "'self' 'unsafe-inline' 'unsafe-eval'"

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "frame-ancestors 'none'",
      // Allow Supabase and websockets
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
      // Allow embedding internal widgets if needed
      "frame-src 'self' https://chat.nepalreforms.com https://*.nepalreforms.com",
      // Prefer HTTPS resources
      'upgrade-insecure-requests',
    ].join('; ')

    // Minimal, privacy-first Permissions-Policy
    const permissionsPolicy = [
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=(self)',
      // Disable cohorting
      'interest-cohort=()'
    ].join(', ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: permissionsPolicy },
          // HSTS only in production (ignored on http://localhost)
          ...(isProd
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
