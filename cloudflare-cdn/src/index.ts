/**
 * Flora Cosmetics — Cloudflare CDN Worker
 *
 * Two responsibilities:
 *  1. Edge proxy in front of Vercel (CDN, DDoS protection, caching)
 *  2. KV proxy — `/kv/:key` endpoints let the Vercel app persist data
 *     in Cloudflare KV without needing a Cloudflare API token.
 *     Protected by a shared secret (KV_AUTH_SECRET Worker secret).
 */

const ORIGIN = 'https://flora-cosmetics.vercel.app'

// Paths that must never be cached regardless of origin headers
const NO_CACHE_PREFIXES = ['/api/', '/admin', '/admin/', '/kv/']

interface Env {
  FLORA_KV: KVNamespace
  KV_AUTH_SECRET: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // ── KV proxy ──────────────────────────────────────────────────────────
    // Only reachable by the Vercel app (authenticated by KV_AUTH_SECRET).
    if (url.pathname.startsWith('/kv/')) {
      const auth = request.headers.get('x-kv-auth')
      if (!env.KV_AUTH_SECRET || auth !== env.KV_AUTH_SECRET) {
        return new Response('Unauthorized', { status: 401 })
      }

      // Key is everything after /kv/
      const key = decodeURIComponent(url.pathname.slice(4))
      if (!key) return new Response('Bad Request', { status: 400 })

      if (request.method === 'GET') {
        const value = await env.FLORA_KV.get(key)
        if (value === null) return new Response('', { status: 404 })
        return new Response(value, {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        })
      }

      if (request.method === 'PUT') {
        const body = await request.text()
        await env.FLORA_KV.put(key, body)
        return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } })
      }

      return new Response('Method Not Allowed', { status: 405 })
    }

    // ── Edge proxy to Vercel ──────────────────────────────────────────────
    const targetUrl = ORIGIN + url.pathname + url.search

    const proxyHeaders = new Headers(request.headers)
    proxyHeaders.set('Host', 'flora-cosmetics.vercel.app')
    proxyHeaders.set('X-Forwarded-Host', url.hostname)
    proxyHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''))

    // Remove client-controllable IP headers to prevent rate-limit bypass.
    // Replace with Cloudflare's CF-Connecting-IP which clients cannot forge.
    proxyHeaders.delete('x-real-ip')
    proxyHeaders.delete('x-forwarded-for')
    const clientIp = request.headers.get('cf-connecting-ip')
    if (clientIp) {
      proxyHeaders.set('x-real-ip', clientIp)
      proxyHeaders.set('x-forwarded-for', clientIp)
    }

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
