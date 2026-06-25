/**
 * Persistent key-value store via the Cloudflare CDN Worker.
 *
 * The Worker (`cloudflare-cdn`) exposes `/kv/:key` GET + PUT endpoints
 * with native KV namespace access — no Cloudflare API token required.
 * All calls are authenticated with a shared KV_AUTH_SECRET.
 *
 * Required environment variables (set via `vercel env add`):
 *   KV_WORKER_URL    — e.g. https://flora-cosmetics-cdn.<account>.workers.dev
 *   KV_AUTH_SECRET   — 64-char hex secret shared with the Worker
 *
 * Local dev fallback: if env vars are absent the store falls back to
 * JSON files on disk so local development works with zero config.
 */

import { mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'fs'
import path from 'path'

const DATA_DIR =
  process.env.DATA_DIR ??
  (process.env.VERCEL ? '/tmp/flora-data' : path.join(process.cwd(), 'data'))

// ---------- File-system fallback (local dev) ----------

function fsRead<T>(key: string): T | null {
  try {
    return JSON.parse(readFileSync(path.join(DATA_DIR, `${key}.json`), 'utf-8')) as T
  } catch {
    return null
  }
}

function fsWrite(key: string, value: unknown): void {
  mkdirSync(DATA_DIR, { recursive: true })
  const target = path.join(DATA_DIR, `${key}.json`)
  const tmp = `${target}.${process.pid}.tmp`
  const content = JSON.stringify(value, null, 2)
  writeFileSync(tmp, content, 'utf-8')
  try {
    renameSync(tmp, target)
  } catch {
    writeFileSync(target, content, 'utf-8')
    try { unlinkSync(tmp) } catch { /* ignore stale tmp */ }
  }
}

// ---------- Cloudflare Worker KV proxy ----------

const KV_WORKER_URL = process.env.KV_WORKER_URL
const KV_AUTH_SECRET = process.env.KV_AUTH_SECRET

function kvReady(): boolean {
  return Boolean(KV_WORKER_URL && KV_AUTH_SECRET)
}

function workerUrl(key: string): string {
  return `${KV_WORKER_URL}/kv/${encodeURIComponent(key)}`
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (!kvReady()) return fsRead<T>(key)

  try {
    const res = await fetch(workerUrl(key), {
      headers: { 'x-kv-auth': KV_AUTH_SECRET! },
      cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) return fsRead<T>(key)
    return JSON.parse(await res.text()) as T
  } catch {
    return fsRead<T>(key) // network error — fall back to local disk
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (!kvReady()) {
    fsWrite(key, value)
    return
  }

  try {
    const res = await fetch(workerUrl(key), {
      method: 'PUT',
      headers: { 'x-kv-auth': KV_AUTH_SECRET!, 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    })
    if (!res.ok) throw new Error(`KV PUT ${res.status}`)
  } catch {
    // If Worker is unreachable, persist locally so data isn't silently lost
    fsWrite(key, value)
  }
}
