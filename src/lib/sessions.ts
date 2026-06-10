/**
 * Stateless HMAC-SHA256-signed session tokens — Edge and Node.js compatible.
 * Format: <64-hex-random>.<expiresAtMs>.<64-hex-hmac>
 *
 * Uses SESSION_SECRET env var (or falls back to ADMIN_PASSWORD).
 * Changing either value immediately invalidates all active sessions.
 * Add SESSION_SECRET to .env.local to decouple session invalidation from password rotation.
 */

const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours

function hexEnc(data: Uint8Array | ArrayBuffer): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function hexDec(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0)
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) out[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return out
}

function signingSecret(): string {
  const s = process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD
  if (!s) throw new Error('SESSION_SECRET or ADMIN_PASSWORD environment variable is required')
  return s
}

async function importKey(usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  )
}

// Server-side revocation for explicit logouts.
// Single-process only — does not survive restarts or span replicas.
// For multi-instance deployments replace with Redis SETNX.
const revoked = new Map<string, number>() // cookie → expiresAt ms

export async function createSession(): Promise<string> {
  const token = hexEnc(crypto.getRandomValues(new Uint8Array(32)))
  const exp = Date.now() + SESSION_TTL_MS
  const payload = `${token}.${exp}`
  const key = await importKey('sign')
  const sig = hexEnc(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
  return `${payload}.${sig}`
}

export async function validateSession(cookie: string | undefined): Promise<boolean> {
  if (!cookie || typeof cookie !== 'string') return false

  // Evict expired revocations to keep the map bounded
  if (revoked.size > 500) {
    const now = Date.now()
    for (const [k, exp] of revoked) if (now > exp) revoked.delete(k)
  }
  if (revoked.has(cookie)) return false

  // Last '.' separates the HMAC signature from the payload
  const lastDot = cookie.lastIndexOf('.')
  if (lastDot < 1 || lastDot === cookie.length - 1) return false
  const payload = cookie.slice(0, lastDot)
  const sigHex = cookie.slice(lastDot + 1)

  // Payload is <token>.<expiresAt>
  const dotIdx = payload.indexOf('.')
  if (dotIdx < 1) return false
  const exp = parseInt(payload.slice(dotIdx + 1), 10)
  if (!Number.isFinite(exp) || Date.now() > exp) return false

  try {
    const key = await importKey('verify')
    const sigBytes = hexDec(sigHex)
    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes.buffer as ArrayBuffer,
      new TextEncoder().encode(payload)
    )
  } catch {
    return false
  }
}

export function destroySession(cookie: string | undefined): void {
  if (!cookie) return
  const lastDot = cookie.lastIndexOf('.')
  if (lastDot < 1) return
  const payload = cookie.slice(0, lastDot)
  const dotIdx = payload.indexOf('.')
  if (dotIdx < 1) return
  const exp = parseInt(payload.slice(dotIdx + 1), 10)
  if (Number.isFinite(exp)) revoked.set(cookie, exp)
}
