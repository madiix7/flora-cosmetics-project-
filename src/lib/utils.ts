import type { CartItem, Product } from '@/types'

export const FREE_DELIVERY_THRESHOLD = 5000
export const DELIVERY_FEE = 500

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-DZ')} DZD`
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}

export function calculateDelivery(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}

export function generateOrderId(): string {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 8)
      : Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')
  return `FL-${Date.now()}-${random}`
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
