import type { NextConfig } from 'next'
import path from 'path'

const isDev = process.env.NODE_ENV !== 'production'

const securityHeaders = [
  // Prevent the site from being embedded in an iframe (clickjacking protection)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop browsers from MIME-sniffing away from the declared content-type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Only send origin in the Referer header on same-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable access to sensitive browser APIs not needed by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enforce HTTPS for 2 years (enable only after confirming full HTTPS deployment)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    // 'unsafe-inline' in script-src is required by the Meta Pixel dangerouslySetInnerHTML block.
    // Long-term: migrate the Pixel script to a Next.js <Script> component with a nonce.
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://www.googletagmanager.com https://connect.facebook.net`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "connect-src 'self' ws://localhost:3000 wss://localhost:3000 https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
