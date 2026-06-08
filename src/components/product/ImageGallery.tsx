'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '@/types'

export function ImageGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] bg-parchment overflow-hidden">
        <Image
          src={product.images[active]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>
      {product.images.length > 1 && (
        <div className="flex gap-3">
          {product.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-20 bg-parchment overflow-hidden border-2 transition-colors ${
                active === i ? 'border-charcoal' : 'border-transparent'
              }`}
            >
              <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
