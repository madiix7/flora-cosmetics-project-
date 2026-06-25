'use client'

import { useState, useRef, useEffect } from 'react'

const ALL_NOTES = [
  // Citrus
  'Bergamot', 'Lemon', 'Orange', 'Grapefruit', 'Lime', 'Mandarin', 'Yuzu',
  'Neroli', 'Petitgrain', 'Bitter Orange',
  // Floral
  'Rose', 'Jasmine', 'Iris', 'Violet', 'Lily', 'Peony', 'Tuberose',
  'Magnolia', 'Freesia', 'Geranium', 'Lavender', 'Ylang-Ylang',
  'Orange Blossom', 'Mimosa', 'Lily of the Valley', 'Heliotrope',
  // Woody
  'Sandalwood', 'Cedar', 'Vetiver', 'Patchouli', 'Oakmoss', 'Oud',
  'Guaiac Wood', 'Birch', 'Pine', 'Cypress', 'Juniper',
  // Oriental / Balsamic
  'Amber', 'Musk', 'Vanilla', 'Benzoin', 'Tonka Bean', 'Labdanum',
  'Frankincense', 'Myrrh', 'Incense', 'Beeswax', 'Caramel',
  // Spicy
  'Pepper', 'Black Pepper', 'Pink Pepper', 'Cardamom', 'Ginger',
  'Cinnamon', 'Clove', 'Saffron', 'Nutmeg', 'Cumin',
  // Fresh / Aquatic
  'Mint', 'Sea Salt', 'Aquatic', 'Marine', 'Green Tea', 'Cucumber',
  'Dew', 'Ozonic', 'Rain',
  // Fruity
  'Peach', 'Apple', 'Pear', 'Raspberry', 'Blackcurrant', 'Strawberry',
  'Plum', 'Cherry', 'Lychee', 'Mango', 'Melon', 'Apricot',
  // Gourmand
  'Coffee', 'Chocolate', 'Almond', 'Honey', 'Praline', 'Coconut',
  // Leather / Smoky
  'Leather', 'Tobacco', 'Smoke', 'Birch Tar',
  // Synthetic / Modern
  'Ambroxan', 'Cashmeran', 'Iso E Super', 'Hedione', 'Galaxolide',
  'Muskowood', 'Ambergris',
  // Roots / Earthy
  'Vetiver', 'Oakmoss', 'Orris Root', 'Moss', 'Earth',
]

// Deduplicate and sort
const NOTES = [...new Set(ALL_NOTES)].sort()

type Props = {
  label: string
  selected: string[]
  onChange: (notes: string[]) => void
}

export function NotesPicker({ label, selected, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim().length === 0
    ? NOTES.filter((n) => !selected.includes(n)).slice(0, 30)
    : NOTES.filter(
        (n) =>
          !selected.includes(n) &&
          n.toLowerCase().includes(query.toLowerCase()),
      )

  const add = (note: string) => {
    if (!selected.includes(note)) onChange([...selected, note])
    setQuery('')
    inputRef.current?.focus()
  }

  const addCustom = () => {
    const trimmed = query.trim()
    if (!trimmed || selected.includes(trimmed)) { setQuery(''); return }
    // Capitalise first letter of each word
    const formatted = trimmed.replace(/\b\w/g, (c) => c.toUpperCase())
    onChange([...selected, formatted])
    setQuery('')
    inputRef.current?.focus()
  }

  const remove = (note: string) => onChange(selected.filter((n) => n !== note))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const exactMatch = NOTES.some((n) => n.toLowerCase() === query.trim().toLowerCase())

  return (
    <div ref={containerRef} className="relative">
      <p className="text-[9px] tracking-widest uppercase text-stone mb-2">{label}</p>

      {/* Selected notes */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((note) => (
            <span
              key={note}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-charcoal text-ivory text-[10px] tracking-wide rounded-full"
            >
              {note}
              <button
                type="button"
                onClick={() => remove(note)}
                className="opacity-60 hover:opacity-100 transition-opacity leading-none text-xs"
                aria-label={`Remove ${note}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); filtered[0] ? add(filtered[0]) : addCustom() }
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder={selected.length === 0 ? 'Search or type a note…' : 'Add more…'}
          className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-2 text-sm text-charcoal placeholder:text-stone/40 outline-none transition-colors pr-8"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-stone/40 hover:text-stone text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-parchment rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.length > 0 ? (
            <div className="p-2 flex flex-wrap gap-1.5">
              {filtered.map((note) => (
                <button
                  key={note}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); add(note) }}
                  className="px-2.5 py-1 text-[10px] tracking-wide border border-parchment rounded-full text-stone hover:bg-charcoal hover:text-ivory hover:border-charcoal transition-colors"
                >
                  {note}
                </button>
              ))}
            </div>
          ) : null}

          {/* Add custom note when no exact match */}
          {query.trim() && !exactMatch && (
            <div className="border-t border-parchment px-3 py-2">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addCustom() }}
                className="text-[10px] tracking-wide text-stone hover:text-charcoal transition-colors"
              >
                + Add &ldquo;{query.trim()}&rdquo; as a custom note
              </button>
            </div>
          )}

          {filtered.length === 0 && !query.trim() && (
            <p className="px-3 py-3 text-[10px] text-stone/50">All notes already selected.</p>
          )}
        </div>
      )}
    </div>
  )
}
