export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-DZ')} DZD`
}

export function calculateTotal(items: import('@/types').CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}

export function generateOrderId(): string {
  return `FL-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function getRelatedProducts(
  products: import('@/types').Product[],
  current: import('@/types').Product,
  limit = 3
): import('@/types').Product[] {
  return products
    .filter(
      (p) =>
        p.id !== current.id &&
        (p.category === current.category ||
          p.scentFamily.some((s) => current.scentFamily.includes(s)))
    )
    .slice(0, limit)
}
