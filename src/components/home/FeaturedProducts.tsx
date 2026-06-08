'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Badge } from '@/components/ui/Badge'

export function FeaturedProducts({ products }: { products: Product[] }) {
  const { addItem } = useCart()

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Curated for you</p>
          <h2 className="font-serif font-light text-3xl md:text-4xl text-charcoal">
            Featured Collection
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors hidden md:block"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/shop/${product.slug}`} className="block">
              <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-4">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.isNew && (
                  <div className="absolute top-3 left-3">
                    <Badge>New</Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors duration-300" />
              </div>
              <p className="font-serif font-light text-lg text-charcoal mb-1">{product.name}</p>
              <p className="text-xs text-stone mb-3">{formatPrice(product.price)}</p>
            </Link>
            <button
              onClick={() => addItem(product, product.sizes[0])}
              className="text-[9px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors opacity-0 group-hover:opacity-100"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
