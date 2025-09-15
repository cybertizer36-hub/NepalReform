import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
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
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', '@radix-ui/react-icons'],
    // Add this if you have middleware and need Node.js runtime
    // nodeMiddleware: true,
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
}

export default withBundleAnalyzer(nextConfig)
