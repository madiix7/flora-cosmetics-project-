'use client'

import type { Category, ScentFamily } from '@/types'

type Filters = {
  category: Category | 'all'
  scent: ScentFamily | 'all'
  sort: 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'
}

type Props = {
  filters: Filters
  onChange: (filters: Filters) => void
}

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'perfume', label: 'Perfume' },
  { value: 'body-care', label: 'Body Care' },
  { value: 'candle', label: 'Candles' },
  { value: 'gift-set', label: 'Gift Sets' },
]

const scents: { value: ScentFamily | 'all'; label: string }[] = [
  { value: 'all', label: 'All Scents' },
  { value: 'floral', label: 'Floral' },
  { value: 'woody', label: 'Woody' },
  { value: 'oriental', label: 'Oriental' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'citrus', label: 'Citrus' },
]

export function FilterSidebar({ filters, onChange }: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Category</p>
        <ul className="space-y-2">
          {categories.map(({ value, label }) => (
            <li key={value}>
              <button
                onClick={() => onChange({ ...filters, category: value })}
                className={`text-sm transition-colors ${
                  filters.category === value
                    ? 'text-charcoal font-medium'
                    : 'text-stone hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Scent Family</p>
        <ul className="space-y-2">
          {scents.map(({ value, label }) => (
            <li key={value}>
              <button
                onClick={() => onChange({ ...filters, scent: value })}
                className={`text-sm transition-colors ${
                  filters.scent === value
                    ? 'text-charcoal font-medium'
                    : 'text-stone hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Sort</p>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as Filters['sort'] })}
          className="text-sm text-charcoal bg-transparent border-b border-parchment pb-1 outline-none w-full"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="bestsellers">Bestsellers</option>
        </select>
      </div>
    </aside>
  )
}
