import type { CartItem, Product } from '@/types'

export function getSizePrice(product: Product, size: string): number {
  return product.sizePrices?.[size] ?? product.price
}

export const FREE_DELIVERY_THRESHOLD = 200
export const DELIVERY_FEE = 8

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} DT`
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateDelivery(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}

export function generateOrderId(): string {
  // Full UUID random — no timestamp component to prevent enumeration
  const id = crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 16)
    : Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) =>
        b.toString(16).padStart(2, '0')
      ).join('').toUpperCase()
  return `FL-${id}`
}

export function getRelatedProducts(
  products: Product[],
  current: Product,
  limit = 3
): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== current.id &&
        (p.category === current.category ||
          p.scentFamily.some((s) => current.scentFamily.includes(s)))
    )
    .slice(0, limit)
}
