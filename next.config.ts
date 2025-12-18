import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // No basePath - app serves at root now

  // Enable React strict mode
  reactStrictMode: true,

  // Powered by header (disable for security)
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
    ],
    // Modern image formats
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental features for Next.js 16
  experimental: {
    // Max body size for proxy requests (useful for file uploads)
    proxyClientMaxBodySize: '10mb',
    
    // Enable server actions
    serverActions: {
      bodySizeLimit: '10mb',
    },

    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'date-fns',
    ],
  },

  // TypeScript configuration
  typescript: {
    // Allow production builds even with type errors (for faster iteration)
    // Set to true in development, false for production
    ignoreBuildErrors: false,
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects (none currently needed)
  async redirects() {
    return []
  },

  // Rewrites (for API proxying if needed)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig

