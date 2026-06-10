import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/sessions'

// 5 attempts per IP per 15-minute window. In-memory — resets on process restart.
// For serverless deployments replace with a distributed store (e.g. Redis / Vercel KV).
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    if (attempts.size > 500) {
      for (const [k, v] of attempts) if (now > v.resetAt) attempts.delete(k)
    }
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim()
  if (!adminPassword) {
    // Do not reveal configuration state — generic 503
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Prefer x-real-ip (set by a trusted reverse proxy) over the spoofable x-forwarded-for
  const forwarded = req.headers.get('x-forwarded-for')
  const ip =
    req.headers.get('x-real-ip') ??
    (forwarded ? forwarded.split(',')[0].trim() : null) ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const password = typeof body?.password === 'string' ? body.password : ''

  // Timing-safe comparison prevents timing-based enumeration of the password
  const a = Buffer.from(password)
  const b = Buffer.from(adminPassword)
  const match = a.length === b.length && timingSafeEqual(a, b)

  if (!match) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await createSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
