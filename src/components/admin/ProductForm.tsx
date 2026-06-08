'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, Category, ScentFamily } from '@/types'

type Props = {
  initial?: Partial<Product>
  mode: 'new' | 'edit'
}

const CATEGORIES: Category[] = ['perfume', 'body-care', 'candle', 'gift-set']
const SCENT_FAMILIES: ScentFamily[] = ['floral', 'woody', 'oriental', 'fresh', 'citrus']

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ProductForm({ initial, mode }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    id: initial?.id ?? String(Date.now()),
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    price: initial?.price ?? 0,
    category: initial?.category ?? 'perfume' as Category,
    scentFamily: initial?.scentFamily ?? [] as ScentFamily[],
    sizes: (initial?.sizes ?? ['30ml']).join(', '),
    images: (initial?.images ?? ['']).join('\n'),
    shortDescription: initial?.shortDescription ?? '',
    description: initial?.description ?? '',
    scentTop: (initial?.scentNotes?.top ?? []).join(', '),
    scentHeart: (initial?.scentNotes?.heart ?? []).join(', '),
    scentBase: (initial?.scentNotes?.base ?? []).join(', '),
    isFeatured: initial?.isFeatured ?? false,
    isNew: initial?.isNew ?? false,
    isBestseller: initial?.isBestseller ?? false,
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const product: Product = {
      id: form.id,
      slug: form.slug || slugify(form.name),
      name: form.name,
      price: Number(form.price),
      category: form.category,
      scentFamily: form.scentFamily,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      shortDescription: form.shortDescription,
      description: form.description,
      scentNotes: {
        top: form.scentTop.split(',').map((s) => s.trim()).filter(Boolean),
        heart: form.scentHeart.split(',').map((s) => s.trim()).filter(Boolean),
        base: form.scentBase.split(',').map((s) => s.trim()).filter(Boolean),
      },
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
    }

    const url = mode === 'new' ? '/api/products' : `/api/products/${product.id}`
    const method = mode === 'new' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })

    setSaving(false)
    if (res.ok) {
      router.push('/admin/products')
      router.refresh()
    } else {
      const { error: msg } = await res.json()
      setError(msg ?? 'Failed to save')
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
            <label className={labelClass}>Slug</label>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Price (DZD) *</label>
            <input required type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-2 text-sm text-charcoal outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Sizes (comma-separated)</label>
          <input value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} placeholder="30ml, 50ml, 100ml" className={inputClass} />
        </div>

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
        <p className="text-[10px] tracking-widest uppercase text-charcoal mb-4">Images</p>
        <label className={labelClass}>Image URLs (one per line)</label>
        <textarea value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} rows={3}
          placeholder="https://images.unsplash.com/..." className="w-full bg-transparent border border-parchment focus:border-charcoal p-3 text-sm text-charcoal placeholder:text-stone/40 outline-none resize-y rounded font-mono" />
      </div>

      {/* Scent */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Top Notes', field: 'scentTop' as const },
            { label: 'Heart Notes', field: 'scentHeart' as const },
            { label: 'Base Notes', field: 'scentBase' as const },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                placeholder="Rose, Jasmine" className={inputClass} />
            </div>
          ))}
        </div>
      </div>

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
