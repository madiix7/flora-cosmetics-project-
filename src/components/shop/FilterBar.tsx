'use client'

import { useState, useRef, useEffect } from 'react'
import type { ScentFamily } from '@/types'
import type { ShopFilters } from '@/app/shop/ShopClient'

const SCENT_OPTIONS: ScentFamily[] = ['floral', 'woody', 'oriental', 'fresh', 'citrus']

function formatTag(tag: string) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type Props = {
  filters: ShopFilters
  onChange: (filters: ShopFilters) => void
  availableBrands: string[]
  seasonTags: string[]
}

export function FilterBar({ filters, onChange, availableBrands, seasonTags }: Props) {
  return (
    <div className="sticky top-16 z-30 bg-white border-b border-parchment shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-3 flex-wrap">
        {availableBrands.length > 0 && (
          <FilterDropdown
            label="Brand"
            options={availableBrands}
            selected={filters.brands}
            onChange={(brands) => onChange({ ...filters, brands })}
          />
        )}

        {seasonTags.length > 0 && (
          <FilterDropdown
            label="Season"
            options={seasonTags}
            selected={filters.seasons}
            onChange={(seasons) => onChange({ ...filters, seasons })}
            formatLabel={formatTag}
          />
        )}

        <FilterDropdown
          label="Scent"
          options={SCENT_OPTIONS}
          selected={filters.scents}
          onChange={(scents) => onChange({ ...filters, scents: scents as ScentFamily[] })}
          formatLabel={formatTag}
        />

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] tracking-widest uppercase text-stone/50 hidden sm:block">Sort</span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as ShopFilters['sort'] })}
            className="text-[10px] tracking-widest uppercase text-stone bg-transparent outline-none cursor-pointer hover:text-charcoal transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="bestsellers">Bestsellers</option>
          </select>
        </div>
      </div>
    </div>
  )
}

type DropdownProps = {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  formatLabel?: (s: string) => string
}

function FilterDropdown({ label, options, selected, onChange, formatLabel = (s) => s }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])
  }

  const isActive = selected.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-widest uppercase border transition-colors ${
          isActive
            ? 'border-charcoal bg-charcoal text-ivory'
            : 'border-parchment text-stone hover:border-charcoal hover:text-charcoal'
        }`}
      >
        {label}
        {isActive && <span className="opacity-75">({selected.length})</span>}
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-parchment shadow-lg z-50 min-w-[180px] py-1.5">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-parchment/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="w-3.5 h-3.5 accent-charcoal"
              />
              <span className="text-sm text-charcoal">{formatLabel(opt)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
