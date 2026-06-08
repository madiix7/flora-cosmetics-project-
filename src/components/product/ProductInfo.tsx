'use client'

import { useState } from 'react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScentNotes } from './ScentNotes'
import { Accordion } from '@/components/ui/Accordion'

export function ProductInfo({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addItem(product, selectedSize, quantity)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {product.isNew && <Badge className="mb-3">New Arrival</Badge>}
        {product.isBestseller && !product.isNew && <Badge className="mb-3 bg-warm-gold">Bestseller</Badge>}
        <h1 className="font-serif font-light text-3xl md:text-4xl text-charcoal mb-2">
          {product.name}
        </h1>
        <p className="font-serif text-2xl text-charcoal">{formatPrice(product.price)}</p>
      </div>

      <div className="w-8 h-px bg-warm-gold" />

      <p className="text-sm text-stone leading-relaxed font-light">{product.shortDescription}</p>

      {product.scentNotes.top.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-3">Scent Notes</p>
          <ScentNotes notes={product.scentNotes} />
        </div>
      )}

      {product.sizes.length > 1 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-3">Size</p>
          <div className="flex gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 text-xs border transition-colors ${
                  selectedSize === size
                    ? 'border-charcoal bg-charcoal text-ivory'
                    : 'border-parchment text-stone hover:border-charcoal'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-3">Quantity</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="w-8 h-8 border border-parchment text-stone hover:border-charcoal text-lg flex items-center justify-center"
          >
            −
          </button>
          <span className="text-sm w-6 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
            className="w-8 h-8 border border-parchment text-stone hover:border-charcoal text-lg flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <Button size="lg" onClick={handleAddToCart} className="mt-2">
        Add to Cart
      </Button>

      <p className="text-[10px] tracking-widest text-stone">
        Cash on delivery · Free shipping over 5,000 DZD
      </p>

      <Accordion
        items={[
          {
            title: 'Description',
            content: <p className="text-sm leading-relaxed">{product.description}</p>,
          },
          {
            title: 'How to Use',
            content: (
              <p className="text-sm leading-relaxed">
                Apply to pulse points — wrists, neck, and behind the ears. For longer-lasting
                fragrance, apply to moisturised skin or layer with our matching body lotion.
              </p>
            ),
          },
          {
            title: 'Delivery',
            content: (
              <p className="text-sm leading-relaxed">
                We deliver across Algeria via cash on delivery. Standard delivery: 3–5 business
                days. Express delivery available in Algiers: 1–2 business days.
              </p>
            ),
          },
        ]}
      />
    </div>
  )
}
