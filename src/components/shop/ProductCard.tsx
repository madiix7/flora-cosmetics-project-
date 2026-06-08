'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Badge } from '@/components/ui/Badge'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <div className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-4">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && <Badge>New</Badge>}
            {product.isBestseller && <Badge className="bg-warm-gold">Bestseller</Badge>}
          </div>
        </div>
        <p className="font-serif font-light text-lg text-charcoal mb-1">{product.name}</p>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-1">{product.category.replace('-', ' ')}</p>
        <p className="text-sm text-charcoal">{formatPrice(product.price)}</p>
      </Link>
      <button
        onClick={() => addItem(product, product.sizes[0])}
        className="mt-3 text-[9px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
      >
        Quick Add
      </button>
    </div>
  )
}
