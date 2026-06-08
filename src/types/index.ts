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
