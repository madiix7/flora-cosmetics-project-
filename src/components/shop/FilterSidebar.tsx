'use client'

import type { Category, ScentFamily } from '@/types'
import type { ShopFilters } from '@/app/shop/ShopClient'

type Props = {
  filters: ShopFilters
  onChange: (filters: ShopFilters) => void
  seasonTags: string[]
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

function formatTag(tag: string) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function FilterSidebar({ filters, onChange, seasonTags }: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
      {/* Season */}
      {seasonTags.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Season</p>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onChange({ ...filters, season: 'all' })}
                className={`text-sm transition-colors ${
                  filters.season === 'all' ? 'text-charcoal font-medium' : 'text-stone hover:text-charcoal'
                }`}
              >
                All Seasons
              </button>
            </li>
            {seasonTags.map((tag) => (
              <li key={tag}>
                <button
                  onClick={() => onChange({ ...filters, season: tag })}
                  className={`text-sm transition-colors ${
                    filters.season === tag ? 'text-charcoal font-medium' : 'text-stone hover:text-charcoal'
                  }`}
                >
                  {formatTag(tag)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Category</p>
        <ul className="space-y-2">
          {categories.map(({ value, label }) => (
            <li key={value}>
              <button
                onClick={() => onChange({ ...filters, category: value })}
                className={`text-sm transition-colors ${
                  filters.category === value ? 'text-charcoal font-medium' : 'text-stone hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Scent Family */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Scent Family</p>
        <ul className="space-y-2">
          {scents.map(({ value, label }) => (
            <li key={value}>
              <button
                onClick={() => onChange({ ...filters, scent: value })}
                className={`text-sm transition-colors ${
                  filters.scent === value ? 'text-charcoal font-medium' : 'text-stone hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Sort</p>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as ShopFilters['sort'] })}
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
