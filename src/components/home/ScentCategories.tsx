import Link from 'next/link'

const categories = [
  { label: 'Floral', emoji: '🌹', query: 'floral' },
  { label: 'Woody', emoji: '🪵', query: 'woody' },
  { label: 'Oriental', emoji: '✨', query: 'oriental' },
  { label: 'Fresh', emoji: '🍃', query: 'fresh' },
  { label: 'Citrus', emoji: '🍊', query: 'citrus' },
]

export function ScentCategories() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <p className="text-[10px] tracking-widest uppercase text-stone mb-8 text-center">
        Shop by Scent Family
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2 justify-center flex-wrap">
        {categories.map((cat) => (
          <Link
            key={cat.query}
            href={`/shop?scent=${cat.query}`}
            className="flex flex-col items-center gap-2 px-8 py-5 bg-parchment hover:bg-sand transition-colors duration-200 min-w-[100px]"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-[10px] tracking-widest uppercase text-stone">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
