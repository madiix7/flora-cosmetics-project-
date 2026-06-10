/**
 * Flora Cosmetics — Cloudflare CDN Worker
 *
 * Acts as a global edge proxy in front of the Vercel deployment.
 * Cloudflare handles: DDoS protection, global PoP caching, TLS termination.
 * Vercel handles: Next.js SSR, API routes, admin panel.
 *
 * Caching strategy (respects Vercel's Cache-Control headers):
 *   /_next/static/*  → immutable, cached 1 year at the edge
 *   /images/*        → cached 1 day
 *   /api/*           → never cached (pass-through)
 *   /admin/*         → never cached (pass-through)
 *   HTML pages       → Cloudflare respects Vercel's Cache-Control
 */

const ORIGIN = 'https://flora-cosmetics.vercel.app'

// Paths that must never be cached regardless of origin headers
const NO_CACHE_PREFIXES = ['/api/', '/admin', '/admin/']

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Build the proxied URL against the Vercel origin
    const targetUrl = ORIGIN + url.pathname + url.search

    // Forward the request with the correct Host header for Vercel routing
    const proxyHeaders = new Headers(request.headers)
    proxyHeaders.set('Host', 'flora-cosmetics.vercel.app')
    proxyHeaders.set('X-Forwarded-Host', url.hostname)
    proxyHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''))

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'follow',
    })

    const response = await fetch(proxyRequest)

    // For sensitive/dynamic paths, strip any accidental caching headers
    const isNoCache = NO_CACHE_PREFIXES.some((p) => url.pathname.startsWith(p))
    if (isNoCache) {
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'no-store')
      return new Response(response.body, { status: response.status, headers })
    }

    return response
  },
}
