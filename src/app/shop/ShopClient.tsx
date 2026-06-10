'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { ProductGrid } from '@/components/shop/ProductGrid'
import type { Category, Product, ScentFamily } from '@/types'

export type ShopFilters = {
  category: Category | 'all'
  audience: string | 'all'
  season: string | 'all'
  scent: ScentFamily | 'all'
  sort: 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'
}

const VALID_SCENTS: (ScentFamily | 'all')[] = ['all', 'floral', 'woody', 'oriental', 'fresh', 'citrus']

function formatTag(tag: string) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type Props = {
  products: Product[]
  audienceTags: string[]
  seasonTags: string[]
}

export function ShopClient({ products, audienceTags, seasonTags }: Props) {
  const searchParams = useSearchParams()

  const rawScent = searchParams.get('scent')
  const initialScent: ScentFamily | 'all' =
    rawScent && VALID_SCENTS.includes(rawScent as ScentFamily) ? (rawScent as ScentFamily) : 'all'

  const rawAudience = searchParams.get('for') ?? 'all'
  const initialAudience = audienceTags.includes(rawAudience) ? rawAudience : 'all'

  const [filters, setFilters] = useState<ShopFilters>({
    category: 'all',
    audience: initialAudience,
    season: 'all',
    scent: initialScent,
    sort: 'newest',
  })

  const filtered = useMemo(() => {
    let result = [...products]
    if (filters.audience !== 'all') result = result.filter((p) => p.tags?.includes(filters.audience as string))
    if (filters.season !== 'all') result = result.filter((p) => p.tags?.includes(filters.season as string))
    if (filters.category !== 'all') result = result.filter((p) => p.category === filters.category)
    if (filters.scent !== 'all') result = result.filter((p) => p.scentFamily.includes(filters.scent as ScentFamily))
    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price)
    if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price)
    if (filters.sort === 'newest') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (filters.sort === 'bestsellers') result = result.filter((p) => p.isBestseller).concat(result.filter((p) => !p.isBestseller))
    return result
  }, [filters, products])

  const audienceOptions = [{ value: 'all', label: 'All' }, ...audienceTags.map((t) => ({ value: t, label: formatTag(t) }))]

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="bg-parchment py-16 text-center">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Explore</p>
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal mb-8">The Collection</h1>

        {audienceOptions.length > 1 && (
          <div className="flex items-center justify-center gap-1">
            {audienceOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilters((f) => ({ ...f, audience: value, season: 'all' }))}
                className={`px-6 py-2 text-[10px] tracking-widest uppercase transition-colors border ${
                  filters.audience === value
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-transparent text-stone border-stone/30 hover:border-charcoal hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active audience heading */}
      {filters.audience !== 'all' && (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif font-light text-2xl text-charcoal">{formatTag(filters.audience)}</h2>
            {filters.season !== 'all' && (
              <>
                <span className="text-stone/40">·</span>
                <span className="text-sm text-stone capitalize">{formatTag(filters.season)}</span>
              </>
            )}
            <span className="text-[10px] tracking-wider uppercase text-stone/50 ml-auto">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          <div className="border-b border-parchment mt-4" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row gap-12">
        <FilterSidebar filters={filters} onChange={setFilters} seasonTags={seasonTags} />
        <ProductGrid products={filtered} />
      </div>
    </div>
  )
}
