import type { NextConfig } from 'next'
import path from 'path'

// CSP is set per-request with a unique nonce in src/middleware.ts.
// Only static security headers that do not need a nonce go here.
const securityHeaders = [
  // Prevent clickjacking (belt-and-suspenders alongside CSP frame-ancestors)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop browsers from MIME-sniffing away from the declared content-type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Only send origin in the Referer header on same-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable access to sensitive browser APIs not needed by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enforce HTTPS for 2 years
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent cross-origin windows from keeping a reference to this window (opener attacks)
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
