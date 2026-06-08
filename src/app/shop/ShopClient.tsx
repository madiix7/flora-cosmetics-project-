'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { products } from '@/data/products'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { ProductGrid } from '@/components/shop/ProductGrid'
import type { Category, ScentFamily } from '@/types'

type Filters = {
  category: Category | 'all'
  scent: ScentFamily | 'all'
  sort: 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'
}

const VALID_SCENTS: (ScentFamily | 'all')[] = ['all', 'floral', 'woody', 'oriental', 'fresh', 'citrus']

export function ShopClient() {
  const searchParams = useSearchParams()
  const rawScent = searchParams.get('scent')
  const initialScent: ScentFamily | 'all' =
    rawScent && VALID_SCENTS.includes(rawScent as ScentFamily) ? (rawScent as ScentFamily) : 'all'

  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    scent: initialScent,
    sort: 'newest',
  })

  const filtered = useMemo(() => {
    let result = [...products]
    if (filters.category !== 'all') result = result.filter((p) => p.category === filters.category)
    if (filters.scent !== 'all') result = result.filter((p) => p.scentFamily.includes(filters.scent as ScentFamily))
    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price)
    if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price)
    if (filters.sort === 'newest') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (filters.sort === 'bestsellers') result = result.filter((p) => p.isBestseller).concat(result.filter((p) => !p.isBestseller))
    return result
  }, [filters])

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Explore</p>
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">The Collection</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex flex-col md:flex-row gap-12">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <ProductGrid products={filtered} />
      </div>
    </div>
  )
}
