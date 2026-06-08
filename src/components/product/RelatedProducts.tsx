import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="border-t border-parchment pt-16 mt-16">
      <p className="text-[10px] tracking-widest uppercase text-stone mb-8 text-center">
        You May Also Like
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link key={p.id} href={`/shop/${p.slug}`} className="group">
            <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-3">
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="font-serif font-light text-base text-charcoal mb-1">{p.name}</p>
            <p className="text-xs text-stone">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
