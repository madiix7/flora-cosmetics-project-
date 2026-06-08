import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="pt-16">
      <div className="relative h-[60vh] bg-sand overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1600"
          alt="Flora Cosmetics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[10px] tracking-widest uppercase text-ivory/60 mb-4">Our Story</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl text-ivory">Flora Cosmetics</h1>
          <div className="w-8 h-px bg-warm-gold mt-6" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-24 space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Origins</p>
            <h2 className="font-serif font-light text-3xl text-charcoal mb-6">
              Born from a love of authentic fragrance
            </h2>
            <div className="w-8 h-px bg-warm-gold mb-6" />
            <p className="text-sm text-stone leading-relaxed font-light mb-4">
              Flora Cosmetics was founded with a conviction: that fragrance should be personal,
              intentional, and enduring. We started small — a studio, a few formulas, and an
              obsession with quality that has never wavered.
            </p>
            <p className="text-sm text-stone leading-relaxed font-light">
              Today, our collection spans perfumes, body care, and home fragrance — each product
              developed with rare raw materials from trusted suppliers around the world.
            </p>
          </div>
          <div className="relative aspect-square bg-parchment overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800"
              alt="Flora studio"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square bg-parchment overflow-hidden order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800"
              alt="Flora ingredients"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Philosophy</p>
            <h2 className="font-serif font-light text-3xl text-charcoal mb-6">
              Small batches. No shortcuts.
            </h2>
            <div className="w-8 h-px bg-warm-gold mb-6" />
            <p className="text-sm text-stone leading-relaxed font-light mb-4">
              We do not mass-produce. Every batch is limited, every formula is ours. We believe
              the best fragrance experiences come from restraint — fewer, better ingredients,
              given the time they need.
            </p>
            <p className="text-sm text-stone leading-relaxed font-light">
              Our products are free from parabens, artificial colourants, and unnecessary fillers.
              What you smell is what is in the bottle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { number: '10+', label: 'Original Fragrances' },
            { number: '100%', label: 'Natural Raw Materials' },
            { number: 'COD', label: 'Cash on Delivery' },
          ].map(({ number, label }) => (
            <div key={label} className="bg-parchment py-10 px-6">
              <p className="font-serif text-4xl font-light text-charcoal mb-2">{number}</p>
              <div className="w-6 h-px bg-warm-gold mx-auto mb-3" />
              <p className="text-[10px] tracking-widest uppercase text-stone">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
