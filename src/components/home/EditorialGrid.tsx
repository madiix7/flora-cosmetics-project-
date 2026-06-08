import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

type Props = {
  featured: Product[]
}

export function EditorialGrid({ featured }: Props) {
  const [main, ...rest] = featured.slice(0, 3)
  if (!main) return null

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-[3fr_2fr] min-h-[90vh]">
      <Link
        href={`/shop/${main.slug}`}
        className="relative overflow-hidden group bg-sand block"
      >
        <Image
          src={main.images[0]}
          alt={main.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12">
          {main.isNew && <Badge className="mb-3">New Arrival</Badge>}
          {main.isBestseller && !main.isNew && <Badge className="mb-3">Bestseller</Badge>}
          <h1 className="font-serif font-light text-4xl md:text-5xl text-ivory leading-tight mb-2">
            {main.name}
          </h1>
          <div className="w-8 h-px bg-warm-gold mb-4" />
          <p className="text-ivory/70 text-sm font-light max-w-xs mb-6">
            {main.shortDescription}
          </p>
          <Button size="lg">Discover</Button>
        </div>
      </Link>

      <div className="grid grid-rows-2">
        {rest.map((product, i) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className={`relative overflow-hidden group block ${
              i === 0 ? 'bg-parchment' : 'bg-sand/60'
            }`}
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              {product.isNew && <Badge className="mb-2 text-[8px]">New</Badge>}
              {product.isBestseller && !product.isNew && (
                <Badge className="mb-2 text-[8px]">Bestseller</Badge>
              )}
              <p className="font-serif font-light text-xl md:text-2xl text-ivory">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
