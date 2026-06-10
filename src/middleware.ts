import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/sessions'

function generateNonce(): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    (b) => b.toString(16).padStart(2, '0')
  ).join('')
}

function buildCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  return [
    "default-src 'self'",
    // 'nonce-{nonce}' + 'strict-dynamic' replaces 'unsafe-inline'.
    // Browsers that support nonces ignore 'unsafe-inline'; 'strict-dynamic' allows
    // scripts dynamically loaded by a trusted (nonced) script (GTM, fbevents.js, etc.)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    // Exclude localhost WS in production; include Meta Pixel event endpoint
    `connect-src 'self'${isDev ? ' ws://localhost:3000 wss://localhost:3000' : ''} https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://connect.facebook.net`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const nonce = generateNonce()
  const csp = buildCSP(nonce)

  // Admin guard: redirect unauthenticated browsers before serving protected pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_session')?.value
    if (!(await validateSession(token))) {
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.headers.set('Content-Security-Policy', csp)
      return res
    }
  }

  // Forward nonce to server components — Next.js automatically attaches it to
  // its own generated inline scripts when it reads 'x-nonce' from request headers
  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-nonce', nonce)

  const res = NextResponse.next({ request: { headers: reqHeaders } })
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  // All routes except Next.js internals and public static files
  matcher: ['/((?!_next/static|_next/image|images|favicon\\.ico).*)'],
}
