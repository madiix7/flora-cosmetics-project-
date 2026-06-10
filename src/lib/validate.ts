import type { Category, ScentFamily, Product } from '@/types'

const VALID_CATEGORIES = new Set<Category>(['perfume', 'body-care', 'candle', 'gift-set'])
const VALID_SCENTS = new Set<ScentFamily>(['floral', 'woody', 'oriental', 'fresh', 'citrus'])

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function safeStrings(val: unknown, maxItemLen: number, maxItems: number): string[] {
  if (!Array.isArray(val)) return []
  return val
    .filter((x): x is string => typeof x === 'string')
    .slice(0, maxItems)
    .map((x) => x.slice(0, maxItemLen).trim())
    .filter(Boolean)
}

function safeImageUrl(url: string): boolean {
  // Only allow absolute HTTPS URLs or root-relative paths. Blocks javascript:, data:, http:.
  return url.startsWith('https://') || url.startsWith('/')
}

type ValidationOk = { ok: true; product: Product }
type ValidationFail = { ok: false; error: string }
export type ProductValidation = ValidationOk | ValidationFail

export function sanitizeProduct(
  body: unknown,
  existingId: string,
  existingCreatedAt?: string
): ProductValidation {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body' }
  const b = body as Record<string, unknown>

  if (typeof b.name !== 'string' || !b.name.trim()) return { ok: false, error: 'name is required' }
  if (typeof b.price !== 'number' || !Number.isFinite(b.price) || b.price < 0)
    return { ok: false, error: 'price must be a non-negative number' }
  if (!VALID_CATEGORIES.has(b.category as Category))
    return { ok: false, error: 'invalid category' }

  const scentNotes = (typeof b.scentNotes === 'object' && b.scentNotes !== null
    ? b.scentNotes
    : {}) as Record<string, unknown>

  const slug =
    typeof b.slug === 'string' && b.slug.trim()
      ? b.slug.replace(/[^a-z0-9-]/g, '').slice(0, 100)
      : toSlug(String(b.name))
  if (!slug) return { ok: false, error: 'name must contain at least one alphanumeric character' }

  return {
    ok: true,
    product: {
      id: existingId,
      slug,
      name: String(b.name).slice(0, 200).trim(),
      price: Math.max(0, Math.round(Number(b.price))),
      category: b.category as Category,
      scentFamily: (Array.isArray(b.scentFamily) ? b.scentFamily : []).filter(
        (s): s is ScentFamily => VALID_SCENTS.has(s as ScentFamily)
      ),
      tags: safeStrings(b.tags, 50, 20),
      sizes: safeStrings(b.sizes, 20, 10),
      images: safeStrings(b.images, 500, 10).filter(safeImageUrl),
      shortDescription:
        typeof b.shortDescription === 'string' ? b.shortDescription.slice(0, 500) : '',
      description: typeof b.description === 'string' ? b.description.slice(0, 5000) : '',
      scentNotes: {
        top: safeStrings(scentNotes.top, 50, 10),
        heart: safeStrings(scentNotes.heart, 50, 10),
        base: safeStrings(scentNotes.base, 50, 10),
      },
      isFeatured: Boolean(b.isFeatured),
      isNew: Boolean(b.isNew),
      isBestseller: Boolean(b.isBestseller),
      createdAt:
        existingCreatedAt ??
        (typeof b.createdAt === 'string' && /^\d{4}-\d{2}-\d{2}/.test(b.createdAt)
          ? b.createdAt.slice(0, 10)
          : new Date().toISOString().slice(0, 10)),
    },
  }
}
