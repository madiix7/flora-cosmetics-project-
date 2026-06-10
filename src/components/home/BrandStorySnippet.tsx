import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type Props = {
  title?: string
  body?: string
}

const DEFAULT_TITLE = 'Born from a passion for authentic fragrance'
const DEFAULT_BODY = `Flora Cosmetics was founded with a single conviction: that fragrance should be personal, intentional, and enduring. Each formula is developed with rare raw materials sourced from trusted suppliers around the world.

We do not mass-produce. We craft in small batches, with care, for people who notice the difference.`

export function BrandStorySnippet({ title, body }: Props) {
  const paragraphs = (body || DEFAULT_BODY).split('\n\n').filter(Boolean)

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      <div className="relative aspect-[4/5] bg-parchment overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1619451683957-bfccd40ba70a?w=800"
          alt="Flora Cosmetics studio"
          fill
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Our Story</p>
        <h2 className="font-serif font-light text-3xl md:text-4xl text-charcoal mb-6 leading-tight">
          {title || DEFAULT_TITLE}
        </h2>
        <div className="w-8 h-px bg-warm-gold mb-6" />
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm text-stone leading-relaxed font-light mb-4">
            {para}
          </p>
        ))}
        <Link href="/about" className="mt-4 inline-block">
          <Button variant="outline">Our Full Story</Button>
        </Link>
      </div>
    </section>
  )
}
