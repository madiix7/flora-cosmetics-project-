'use client'

import type { ScentFamily } from '@/types'
import type { ShopFilters } from '@/app/shop/ShopClient'

type Props = {
  filters: ShopFilters
  onChange: (filters: ShopFilters) => void
  seasonTags: string[]
}

const SCENTS: ScentFamily[] = ['floral', 'woody', 'oriental', 'fresh', 'citrus']

function formatTag(tag: string) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
}

export function FilterSidebar({ filters, onChange, seasonTags }: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
      {seasonTags.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Season</p>
          <ul className="space-y-2">
            {seasonTags.map((tag) => (
              <li key={tag}>
                <button
                  onClick={() => onChange({ ...filters, seasons: toggle(filters.seasons, tag) })}
                  className={`text-sm transition-colors ${
                    filters.seasons.includes(tag)
                      ? 'text-charcoal font-medium'
                      : 'text-stone hover:text-charcoal'
                  }`}
                >
                  {formatTag(tag)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Scent Family</p>
        <ul className="space-y-2">
          {SCENTS.map((s) => (
            <li key={s}>
              <button
                onClick={() => onChange({ ...filters, scents: toggle(filters.scents, s) })}
                className={`text-sm transition-colors ${
                  filters.scents.includes(s)
                    ? 'text-charcoal font-medium'
                    : 'text-stone hover:text-charcoal'
                }`}
              >
                {formatTag(s)}
              </button>
            </li>
          ))}
        </ul>
      </div>

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
