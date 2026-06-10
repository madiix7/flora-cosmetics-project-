import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'fs'
import { cache } from 'react'
import path from 'path'
import type { Order, Product, Settings } from '@/types'
import { products as staticProducts } from '@/data/products'

// Vercel serverless functions have a read-only project root — use /tmp instead.
// DATA_DIR env var lets you override this for self-hosted deployments.
const DATA_DIR =
  process.env.DATA_DIR ??
  (process.env.VERCEL ? '/tmp/flora-data' : path.join(process.cwd(), 'data'))

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(path.join(DATA_DIR, filename), 'utf-8')) as T
}

function writeJSON<T>(filename: string, data: T): void {
  mkdirSync(DATA_DIR, { recursive: true })
  const target = path.join(DATA_DIR, filename)
  const tmp = `${target}.${process.pid}.tmp`
  const content = JSON.stringify(data, null, 2)
  writeFileSync(tmp, content, 'utf-8')
  try {
    renameSync(tmp, target)
  } catch {
    // Windows fallback: rename may fail if target exists in some configurations
    writeFileSync(target, content, 'utf-8')
    try { unlinkSync(tmp) } catch { /* ignore stale tmp */ }
  }
}

export function getOrders(): Order[] {
  try { return readJSON<Order[]>('orders.json') } catch { return [] }
}

export function saveOrders(orders: Order[]): void {
  writeJSON('orders.json', orders)
}

export const getProducts = cache((): Product[] => {
  try {
    const data = readJSON<Product[]>('products.json')
    if (Array.isArray(data) && data.length > 0) return data
    return staticProducts
  } catch {
    return staticProducts
  }
})

export function saveProducts(products: Product[]): void {
  writeJSON('products.json', products)
}

const DEFAULT_SETTINGS: Settings = {
  googleAnalyticsId: '',
  metaPixelId: '',
  storeName: 'Flora Cosmetics',
  storeTagline: 'Artisan Perfumerie',
  storePhone: '',
  storeEmail: '',
  storeAddress: '',
  storeWilaya: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  announcementEnabled: false,
  announcementText: 'Free delivery on orders over 200 DT',
  announcementLink: '',
  freeDeliveryThreshold: 200,
  deliveryFee: 8,
  brandStoryTitle: 'Born from a passion for authentic fragrance',
  brandStoryBody: 'Flora Cosmetics was founded with a single conviction: that fragrance should be personal, intentional, and enduring. Each formula is developed with rare raw materials sourced from trusted suppliers around the world.\n\nWe do not mass-produce. We craft in small batches, with care, for people who notice the difference.',
  audienceTags: ['women', 'men'],
  seasonTags: ['spring', 'summer', 'autumn', 'winter'],
}

// React.cache deduplicates calls within a single server render (no repeated fs reads per request)
export const getSettings = cache((): Settings => {
  try {
    const raw = readJSON<Partial<Settings>>('settings.json')
    return { ...DEFAULT_SETTINGS, ...raw }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
})

export function saveSettings(settings: Settings): void {
  writeJSON('settings.json', settings)
}
