export type Category = 'perfume' | 'body-care' | 'candle' | 'gift-set'
export type ScentFamily = 'floral' | 'woody' | 'oriental' | 'fresh' | 'citrus'

export type ScentNotes = {
  top: string[]
  heart: string[]
  base: string[]
}

export type Product = {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  category: Category
  scentFamily: ScentFamily[]
  tags: string[]
  sizes: string[]
  shortDescription: string
  description: string
  scentNotes: ScentNotes
  isFeatured: boolean
  isNew: boolean
  isBestseller: boolean
  createdAt: string
}

export type CartItem = {
  product: Product
  size: string
  quantity: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  items: CartItem[]
  customer: {
    fullName: string
    phone: string
    wilaya: string
    address: string
    notes: string
  }
  total: number
  status: OrderStatus
  createdAt: string
}

export type Settings = {
  googleAnalyticsId: string
  metaPixelId: string
  storeName: string
  storeTagline: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  storeWilaya: string
  instagram: string
  facebook: string
  tiktok: string
  announcementEnabled: boolean
  announcementText: string
  announcementLink: string
  freeDeliveryThreshold: number
  deliveryFee: number
  brandStoryTitle: string
  brandStoryBody: string
  audienceTags: string[]
  seasonTags: string[]
}
