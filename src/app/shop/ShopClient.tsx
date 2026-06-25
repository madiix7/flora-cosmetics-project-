'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Fuse from 'fuse.js'
import { FilterBar } from '@/components/shop/FilterBar'
import { ProductGrid } from '@/components/shop/ProductGrid'
import type { Product, ScentFamily } from '@/types'

export type ShopFilters = {
  audience: string | 'all'
  brands: string[]
  seasons: string[]
  scents: ScentFamily[]
  sort: 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'
}

const VALID_SCENTS: ScentFamily[] = ['floral', 'woody', 'oriental', 'fresh', 'citrus']

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

  const rawAudience = searchParams.get('for') ?? 'all'
  const initialAudience = audienceTags.includes(rawAudience) ? rawAudience : 'all'

  const rawScent = searchParams.get('scent')
  const initialScents: ScentFamily[] =
    rawScent && VALID_SCENTS.includes(rawScent as ScentFamily) ? [rawScent as ScentFamily] : []

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<ShopFilters>({
    audience: initialAudience,
    brands: [],
    seasons: [],
    scents: initialScents,
    sort: 'newest',
  })

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'brand', weight: 2.5 },
          { name: 'shortDescription', weight: 2 },
          { name: 'scentFamily', weight: 1.5 },
          { name: 'tags', weight: 1 },
          { name: 'scentNotes.top', weight: 0.8 },
          { name: 'scentNotes.heart', weight: 0.8 },
          { name: 'scentNotes.base', weight: 0.8 },
        ],
        threshold: 0.45,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [products]
  )

  const availableBrands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b))].sort(),
    [products]
  )

  const filtered = useMemo(() => {
    const trimmed = query.trim()
    let result: Product[] = trimmed
      ? fuse.search(trimmed).map((r) => r.item)
      : [...products]

    if (filters.audience !== 'all')
      result = result.filter((p) => p.tags?.includes(filters.audience as string))
    if (filters.brands.length > 0)
      result = result.filter((p) => p.brand && filters.brands.includes(p.brand))
    if (filters.seasons.length > 0)
      result = result.filter((p) => filters.seasons.some((s) => p.tags?.includes(s)))
    if (filters.scents.length > 0)
      result = result.filter((p) => filters.scents.some((s) => p.scentFamily.includes(s)))

    if (!trimmed) {
      if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price)
      if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price)
      if (filters.sort === 'newest')
        result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      if (filters.sort === 'bestsellers')
        result = result
          .filter((p) => p.isBestseller)
          .concat(result.filter((p) => !p.isBestseller))
    }

    return result
  }, [filters, products, fuse, query])

  const hasSubFilters =
    filters.brands.length > 0 || filters.seasons.length > 0 || filters.scents.length > 0

  const clearSubFilters = () =>
    setFilters((f) => ({ ...f, brands: [], seasons: [], scents: [] }))

  const switchAudience = (audience: string) =>
    setFilters((f) => ({ ...f, audience, brands: [], seasons: [], scents: [] }))

  const genderTabs = [
    { value: 'all', label: 'All' },
    ...audienceTags.map((t) => ({ value: t, label: formatTag(t) })),
  ]

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="bg-parchment py-16 text-center">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Explore</p>
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal mb-8">
          The Collection
        </h1>

        {/* Search */}
        <div className="max-w-md mx-auto px-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone/50 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, scent, brand…"
              className="w-full pl-11 pr-4 py-3 bg-ivory border border-parchment text-sm text-charcoal placeholder:text-stone/40 outline-none focus:border-charcoal transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone/40 hover:text-charcoal transition-colors"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gender tabs */}
      {audienceTags.length > 0 && (
        <div className="bg-ivory border-b border-parchment">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex overflow-x-auto">
            {genderTabs.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => switchAudience(value)}
                className={`px-8 py-5 text-[11px] tracking-widest uppercase whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                  filters.audience === value
                    ? 'border-charcoal text-charcoal font-medium'
                    : 'border-transparent text-stone hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        availableBrands={availableBrands}
        seasonTags={seasonTags}
      />

      {/* Active filter chips */}
      {hasSubFilters && (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex flex-wrap items-center gap-2 border-b border-parchment">
          {filters.brands.map((b) => (
            <FilterChip
              key={b}
              label={b}
              onRemove={() =>
                setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== b) }))
              }
            />
          ))}
          {filters.seasons.map((s) => (
            <FilterChip
              key={s}
              label={formatTag(s)}
              onRemove={() =>
                setFilters((f) => ({ ...f, seasons: f.seasons.filter((x) => x !== s) }))
              }
            />
          ))}
          {filters.scents.map((s) => (
            <FilterChip
              key={s}
              label={formatTag(s)}
              onRemove={() =>
                setFilters((f) => ({ ...f, scents: f.scents.filter((x) => x !== s) }))
              }
            />
          ))}
          <button
            onClick={clearSubFilters}
            className="text-[9px] tracking-widest uppercase text-stone/50 hover:text-charcoal transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          {query.trim() ? (
            <p className="text-sm text-stone">
              {filtered.length === 0 ? (
                <>No results for <span className="font-serif text-charcoal italic">"{query}"</span></>
              ) : (
                <>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} for{' '}
                  <span className="font-serif text-charcoal italic">"{query}"</span>
                </>
              )}
            </p>
          ) : (
            <p className="text-[10px] tracking-widest uppercase text-stone">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              {filters.audience !== 'all' && (
                <> · <span className="text-charcoal">{formatTag(filters.audience as string)}</span></>
              )}
            </p>
          )}
        </div>
        <ProductGrid products={filtered} />
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment text-charcoal text-[10px] tracking-wide">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="opacity-50 hover:opacity-100 transition-opacity leading-none"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </span>
  )
}
