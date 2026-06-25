import { cache } from 'react'
import type { Order, Product, Settings } from '@/types'
import { products as staticProducts } from '@/data/products'
import { kvGet, kvSet } from './kv'

// Redis key names
const KEYS = { products: 'products', orders: 'orders', settings: 'settings' } as const

// ---- Products ----

// React.cache deduplicates concurrent calls within a single server render pass.
export const getProducts = cache(async (): Promise<Product[]> => {
  const data = await kvGet<Product[]>(KEYS.products)
  if (Array.isArray(data) && data.length > 0) return data
  return staticProducts
})

export async function saveProducts(products: Product[]): Promise<void> {
  await kvSet(KEYS.products, products)
}

// ---- Orders ----

export async function getOrders(): Promise<Order[]> {
  return (await kvGet<Order[]>(KEYS.orders)) ?? []
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await kvSet(KEYS.orders, orders)
}

// ---- Settings ----

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
  brandStoryBody:
    'Flora Cosmetics was founded with a single conviction: that fragrance should be personal, intentional, and enduring. Each formula is developed with rare raw materials sourced from trusted suppliers around the world.\n\nWe do not mass-produce. We craft in small batches, with care, for people who notice the difference.',
  audienceTags: ['women', 'men'],
  seasonTags: ['spring', 'summer', 'autumn', 'winter'],
}

export const getSettings = cache(async (): Promise<Settings> => {
  const raw = await kvGet<Partial<Settings>>(KEYS.settings)
  return raw ? { ...DEFAULT_SETTINGS, ...raw } : { ...DEFAULT_SETTINGS }
})

export async function saveSettings(settings: Settings): Promise<void> {
  await kvSet(KEYS.settings, settings)
}
