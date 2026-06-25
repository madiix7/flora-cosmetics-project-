'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, Category, ScentFamily } from '@/types'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { NotesPicker } from '@/components/admin/NotesPicker'

type SizeEntry = { label: string; price: string }

type Props = {
  initial?: Partial<Product>
  mode: 'new' | 'edit'
  audienceTags: string[]
  seasonTags: string[]
}

const CATEGORIES: Category[] = ['perfume', 'body-care', 'candle', 'gift-set']
const SCENT_FAMILIES: ScentFamily[] = ['floral', 'woody', 'oriental', 'fresh', 'citrus']

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function formatTag(tag: string) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ProductForm({ initial, mode, audienceTags, seasonTags }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    id: initial?.id ?? String(Date.now()),
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    brand: initial?.brand ?? '',
    category: initial?.category ?? 'perfume' as Category,
    scentFamily: initial?.scentFamily ?? [] as ScentFamily[],
    tags: initial?.tags ?? [] as string[],
    images: initial?.images ?? [] as string[],
    shortDescription: initial?.shortDescription ?? '',
    description: initial?.description ?? '',
    scentTop: initial?.scentNotes?.top ?? [] as string[],
    scentHeart: initial?.scentNotes?.heart ?? [] as string[],
    scentBase: initial?.scentNotes?.base ?? [] as string[],
    isFeatured: initial?.isFeatured ?? false,
    isNew: initial?.isNew ?? false,
    isBestseller: initial?.isBestseller ?? false,
  })

  const [sizeEntries, setSizeEntries] = useState<SizeEntry[]>(() => {
    const sizes = (initial?.sizes ?? []).filter(Boolean)
    return sizes.map((label) => ({
      label,
      price: String(initial?.sizePrices?.[label] ?? initial?.price ?? 0),
    }))
  })
  const [sizeInput, setSizeInput] = useState('')
  const sizeInputRef = useRef<HTMLInputElement>(null)

  const addSizeFromInput = () => {
    const trimmed = sizeInput.trim()
    if (!trimmed) return
    if (sizeEntries.some((e) => e.label.toLowerCase() === trimmed.toLowerCase())) {
      setSizeInput('')
      return
    }
    const defaultPrice = sizeEntries[0]?.price ?? '0'
    setSizeEntries((s) => [...s, { label: trimmed, price: defaultPrice }])
    setSizeInput('')
    sizeInputRef.current?.focus()
  }

  const removeSizeEntry = (i: number) => setSizeEntries((s) => s.filter((_, idx) => idx !== i))
  const updateSizePrice = (i: number, price: string) =>
    setSizeEntries((s) => s.map((entry, idx) => idx === i ? { ...entry, price } : entry))

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: mode === 'new' ? slugify(name) : f.slug }))
  }

  const toggleScent = (family: ScentFamily) => {
    setForm((f) => ({
      ...f,
      scentFamily: f.scentFamily.includes(family)
        ? f.scentFamily.filter((s) => s !== family)
        : [...f.scentFamily, family],
    }))
  }

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const validEntries = sizeEntries.filter((s) => s.label.trim())
    const sizes = validEntries.map((s) => s.label.trim())
    const sizePrices: Record<string, number> = {}
    validEntries.forEach((s) => {
      const p = Number(s.price)
      if (!isNaN(p) && p >= 0) sizePrices[s.label.trim()] = Math.round(p)
    })
    const price = validEntries.length > 0 ? (Math.round(Number(validEntries[0].price)) || 0) : 0

    const product: Product = {
      id: form.id,
      slug: form.slug || slugify(form.name),
      name: form.name,
      ...(form.brand.trim() ? { brand: form.brand.trim() } : {}),
      price,
      category: form.category,
      scentFamily: form.scentFamily,
      tags: form.tags,
      sizes,
      ...(Object.keys(sizePrices).length > 0 ? { sizePrices } : {}),
      images: form.images,
      shortDescription: form.shortDescription,
      description: form.description,
      scentNotes: {
        top: form.scentTop,
        heart: form.scentHeart,
        base: form.scentBase,
      },
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
    }

    const url = mode === 'new' ? '/api/products' : `/api/products/${product.id}`
    const method = mode === 'new' ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })

      if (res.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError((body as { error?: string }).error ?? 'Failed to save. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full bg-transparent border-b border-parchment focus:border-charcoal py-2 text-sm text-charcoal placeholder:text-stone/40 outline-none transition-colors'
  const labelClass = 'block text-[9px] tracking-widest uppercase text-stone mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-2 rounded">{error}</p>}

      {/* Basic info */}
      <div className="bg-ivory rounded border border-parchment p-6 space-y-5">
        <p className="text-[10px] tracking-widest uppercase text-charcoal mb-2">Basic Information</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Name *</label>
            <input required value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Oud Intense" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="e.g. Dior" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Slug</label>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category *</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-2 text-sm text-charcoal outline-none">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
          </select>
        </div>

        {/* Sizes — tag input */}
        <div>
          <label className={labelClass}>Sizes</label>
          {sizeEntries.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {sizeEntries.map((entry, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-charcoal text-ivory text-[10px] tracking-wide rounded-full"
                >
                  {entry.label}
                  <button
                    type="button"
                    onClick={() => removeSizeEntry(i)}
                    className="opacity-60 hover:opacity-100 transition-opacity leading-none"
                    aria-label={`Remove ${entry.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            ref={sizeInputRef}
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addSizeFromInput() }
            }}
            placeholder={sizeEntries.length === 0 ? 'Type a size and press Enter — e.g. 100ml' : 'Add another size…'}
            className={inputClass}
          />
          <p className="text-[9px] text-stone/40 mt-1">Press Enter to confirm each size.</p>
        </div>

        {/* Prices — one field per confirmed size */}
        {sizeEntries.length > 0 && (
          <div>
            <label className={labelClass}>Prices</label>
            <div className="space-y-3 mt-1">
              {sizeEntries.map((entry, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-charcoal w-20 shrink-0">{entry.label}</span>
                  <input
                    type="number"
                    min={0}
                    value={entry.price}
                    onChange={(e) => updateSizePrice(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                    placeholder="0"
                    className={`${inputClass} max-w-[160px]`}
                  />
                  <span className="text-[10px] text-stone shrink-0">DT</span>
                  {i === 0 && (
                    <span className="text-[9px] text-stone/40 shrink-0">default</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Short Description</label>
          <input value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Full Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4}
            className="w-full bg-transparent border border-parchment focus:border-charcoal p-3 text-sm text-charcoal placeholder:text-stone/40 outline-none resize-y rounded" />
        </div>
      </div>

      {/* Images */}
      <div className="bg-ivory rounded border border-parchment p-6">
        <p className="text-[10px] tracking-widest uppercase text-charcoal mb-1">Product Photos</p>
        <p className="text-xs text-stone mb-5">
          Upload photos from your computer or drag them directly onto the area below.
          The first photo is shown as the main product image.
        </p>
        <ImageUploader
          images={form.images}
          onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
          maxImages={10}
        />
      </div>

      {/* Collections */}
      {(audienceTags.length > 0 || seasonTags.length > 0) && (
        <div className="bg-ivory rounded border border-parchment p-6 space-y-5">
          <p className="text-[10px] tracking-widest uppercase text-charcoal">Collections</p>

          {audienceTags.length > 0 && (
            <div>
              <p className="text-[9px] tracking-widest uppercase text-stone mb-2">Audience</p>
              <div className="flex gap-2 flex-wrap">
                {audienceTags.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-[10px] tracking-widest uppercase rounded transition-colors ${
                      form.tags.includes(tag) ? 'bg-charcoal text-ivory' : 'border border-parchment text-stone hover:border-charcoal'
                    }`}>
                    {formatTag(tag)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {seasonTags.length > 0 && (
            <div>
              <p className="text-[9px] tracking-widest uppercase text-stone mb-2">Season</p>
              <div className="flex gap-2 flex-wrap">
                {seasonTags.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-[10px] tracking-widest uppercase rounded transition-colors ${
                      form.tags.includes(tag) ? 'bg-charcoal text-ivory' : 'border border-parchment text-stone hover:border-charcoal'
                    }`}>
                    {formatTag(tag)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[9px] text-stone/50">Manage available tags in Content → Categories.</p>
        </div>
      )}

      {/* Scent — perfumes only */}
      {form.category === 'perfume' && (
        <div className="bg-ivory rounded border border-parchment p-6 space-y-5">
          <p className="text-[10px] tracking-widest uppercase text-charcoal mb-2">Scent Profile</p>

          <div>
            <label className={labelClass}>Scent Families</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {SCENT_FAMILIES.map((f) => (
                <button key={f} type="button" onClick={() => toggleScent(f)}
                  className={`px-3 py-1.5 text-[10px] tracking-widest uppercase rounded transition-colors ${
                    form.scentFamily.includes(f) ? 'bg-charcoal text-ivory' : 'border border-parchment text-stone hover:border-charcoal'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            <NotesPicker
              label="Top Notes"
              selected={form.scentTop}
              onChange={(notes) => setForm((f) => ({ ...f, scentTop: notes }))}
            />
            <NotesPicker
              label="Heart Notes"
              selected={form.scentHeart}
              onChange={(notes) => setForm((f) => ({ ...f, scentHeart: notes }))}
            />
            <NotesPicker
              label="Base Notes"
              selected={form.scentBase}
              onChange={(notes) => setForm((f) => ({ ...f, scentBase: notes }))}
            />
          </div>
        </div>
      )}

      {/* Flags */}
      <div className="bg-ivory rounded border border-parchment p-6">
        <p className="text-[10px] tracking-widest uppercase text-charcoal mb-4">Visibility Flags</p>
        <div className="flex gap-6">
          {[
            { label: 'Featured on homepage', field: 'isFeatured' as const },
            { label: 'Mark as New', field: 'isNew' as const },
            { label: 'Bestseller', field: 'isBestseller' as const },
          ].map(({ label, field }) => (
            <label key={field} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.checked }))}
                className="w-4 h-4 accent-charcoal" />
              <span className="text-xs text-charcoal">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button type="submit" disabled={saving}
          className="bg-charcoal text-ivory px-8 py-3 text-[10px] tracking-widest uppercase hover:bg-charcoal/80 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : mode === 'new' ? 'Create Product' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-parchment text-stone px-8 py-3 text-[10px] tracking-widest uppercase hover:border-charcoal hover:text-charcoal transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
