'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { calculateTotal } from '@/lib/utils'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const { items, totalItems } = useCart()
  const total = calculateTotal(items)

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">Your Cart</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-3xl font-light text-charcoal mb-4">Your cart is empty</p>
            <p className="text-sm text-stone mb-8">Discover our collection of artisan fragrances.</p>
            <Link href="/shop">
              <Button>Shop the Collection</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-stone mb-2">
                {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
              </p>
              {items.map((item) => (
                <CartItem key={`${item.product.id}-${item.size}`} item={item} />
              ))}
              <Link
                href="/shop"
                className="inline-block mt-6 text-[10px] tracking-widest uppercase text-stone hover:text-charcoal"
              >
                ← Continue Shopping
              </Link>
            </div>
            <CartSummary total={total} />
          </div>
        )}
      </div>
    </div>
  )
}
