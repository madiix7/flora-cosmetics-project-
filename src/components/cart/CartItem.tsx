'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CartItem as CartItemType } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

export function CartItem({ item }: { item: CartItemType }) {
  const { removeItem, updateQuantity } = useCart()

  return (
    <div className="flex gap-6 py-6 border-b border-parchment">
      <Link href={`/shop/${item.product.slug}`} className="relative w-24 h-32 bg-parchment shrink-0">
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Link href={`/shop/${item.product.slug}`}>
              <p className="font-serif text-lg text-charcoal hover:text-stone transition-colors">
                {item.product.name}
              </p>
            </Link>
            <p className="text-[10px] tracking-widest uppercase text-stone mt-1">{item.size}</p>
          </div>
          <p className="font-serif text-lg text-charcoal shrink-0">
            {formatPrice(item.product.price * item.quantity)}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center border border-parchment">
            <button
              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
              className="w-8 h-8 text-stone hover:text-charcoal flex items-center justify-center"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
              className="w-8 h-8 text-stone hover:text-charcoal flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.product.id, item.size)}
            className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
