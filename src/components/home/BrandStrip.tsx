import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function BrandStrip() {
  return (
    <section className="bg-charcoal text-ivory py-24 px-6 text-center">
      <p className="text-[10px] tracking-widest uppercase text-ivory/40 mb-6">The Flora Philosophy</p>
      <h2 className="font-serif font-light text-3xl md:text-5xl italic max-w-2xl mx-auto leading-tight mb-4">
        Every scent tells a story you carry with you
      </h2>
      <div className="w-8 h-px bg-warm-gold mx-auto mb-8" />
      <p className="text-ivory/60 text-sm font-light max-w-md mx-auto mb-10 leading-relaxed">
        We believe fragrance is the most personal luxury. Our collection is built for those who
        choose their signature with intention.
      </p>
      <Link href="/shop">
        <Button variant="outline" className="border-ivory/40 text-ivory hover:bg-ivory hover:text-charcoal">
          Discover the Collection
        </Button>
      </Link>
    </section>
  )
}
