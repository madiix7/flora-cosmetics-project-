import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from './sessions'

// ALLOWED_ORIGINS: comma-separated list of trusted proxy origins (e.g. a Cloudflare Worker URL).
// Required when a reverse proxy sits in front of Vercel and rewrites the Host header,
// causing the browser's Origin to differ from the Vercel Host.
const EXTRA_ORIGINS: Set<string> = new Set(
  (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => {
      try { return new URL(s.trim()).host } catch { return '' }
    })
    .filter(Boolean)
)

/**
 * Returns false if the Origin header is present and does not match
 * the Host header (or any explicitly trusted proxy origin).
 * Allows non-browser clients (curl, mobile SDKs) that send no Origin header.
 */
function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('host') ?? ''
  try {
    const originHost = new URL(origin).host
    return originHost === host || EXTRA_ORIGINS.has(originHost)
  } catch {
    return false
  }
}

export async function requireAdmin(req?: NextRequest): Promise<NextResponse | null> {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  if (!(await validateSession(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (req && !originAllowed(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}
