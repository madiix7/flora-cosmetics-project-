import { NextRequest, NextResponse } from 'next/server'
import { getSettings, saveSettings } from '@/lib/server-data'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit'
import type { Settings } from '@/types'

const STRING_FIELDS: (keyof Settings)[] = [
  'storeName', 'storeTagline', 'storePhone', 'storeEmail', 'storeAddress', 'storeWilaya',
  'instagram', 'facebook', 'tiktok', 'announcementText', 'announcementLink',
  'brandStoryTitle', 'googleAnalyticsId', 'metaPixelId',
]

// Exhaustive allowlist of every key that PATCH is permitted to modify.
// Unknown keys sent by clients are silently dropped — no spread-based mass-assignment.
const PATCHABLE_KEYS = new Set<keyof Settings>([
  ...STRING_FIELDS,
  'brandStoryBody',
  'freeDeliveryThreshold',
  'deliveryFee',
  'announcementEnabled',
  'audienceTags',
  'seasonTags',
])
const STRING_MAX = 2000
const BODY_MAX = 10000
const TAG_MAX_ITEMS = 20
const TAG_MAX_LEN = 50

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth
  return NextResponse.json(await getSettings())
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth) return auth

  const body = await req.json().catch(() => ({})) as Partial<Settings>

  // Numeric fields
  for (const field of ['freeDeliveryThreshold', 'deliveryFee'] as const) {
    const val = body[field]
    if (val !== undefined && (typeof val !== 'number' || !Number.isFinite(val) || val < 0)) {
      return NextResponse.json({ error: `${field} must be a non-negative number` }, { status: 400 })
    }
  }

  // String fields — length limits
  for (const field of STRING_FIELDS) {
    const val = body[field]
    if (typeof val === 'string' && val.length > STRING_MAX) {
      return NextResponse.json({ error: `${field} must be under ${STRING_MAX} characters` }, { status: 400 })
    }
  }
  if (typeof body.brandStoryBody === 'string' && body.brandStoryBody.length > BODY_MAX) {
    return NextResponse.json({ error: `brandStoryBody must be under ${BODY_MAX} characters` }, { status: 400 })
  }

  // Array fields — type + length limits
  for (const field of ['audienceTags', 'seasonTags'] as const) {
    const val = body[field]
    if (val !== undefined) {
      if (!Array.isArray(val) || (val as unknown[]).some((t) => typeof t !== 'string')) {
        return NextResponse.json({ error: `${field} must be an array of strings` }, { status: 400 })
      }
      if (val.length > TAG_MAX_ITEMS) {
        return NextResponse.json({ error: `${field} cannot exceed ${TAG_MAX_ITEMS} entries` }, { status: 400 })
      }
      // Sanitize individual tag lengths
      ;(body as Record<string, unknown>)[field] = (val as string[]).map((t) =>
        String(t).slice(0, TAG_MAX_LEN).trim()
      )
    }
  }

  // Boolean fields
  if (body.announcementEnabled !== undefined && typeof body.announcementEnabled !== 'boolean') {
    return NextResponse.json({ error: 'announcementEnabled must be a boolean' }, { status: 400 })
  }

  const current = await getSettings()
  // Whitelist-only merge: copy only PATCHABLE_KEYS from body into current settings.
  // This prevents prototype pollution and mass-assignment of internal/unknown fields.
  const updated = { ...current } as Settings
  for (const key of Object.keys(body) as (keyof Settings)[]) {
    if (PATCHABLE_KEYS.has(key)) {
      ;(updated as Record<string, unknown>)[key] = (body as Record<string, unknown>)[key]
    }
  }
  await saveSettings(updated)
  auditLog('settings.updated', { fields: Object.keys(body) })
  return NextResponse.json(updated)
}
