'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false) })
  }, [])

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const visible = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Manage</p>
          <h1 className="font-serif font-light text-3xl text-charcoal">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-charcoal text-ivory px-5 py-2.5 text-[10px] tracking-widest uppercase hover:bg-charcoal/80 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="bg-ivory border border-parchment px-4 py-2 text-sm text-charcoal placeholder:text-stone/50 outline-none focus:border-charcoal transition-colors rounded w-64"
        />
      </div>

      <div className="bg-ivory rounded border border-parchment overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-stone">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone">No products found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-parchment bg-parchment/40">
                {['', 'Name', 'Category', 'Price', 'Sizes', 'Flags', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] tracking-widest uppercase text-stone font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment">
              {visible.map((product) => (
                <tr key={product.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="px-4 py-3 w-14">
                    <div className="relative w-10 h-12 bg-parchment overflow-hidden">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-serif text-charcoal">{product.name}</p>
                    <p className="text-[10px] text-stone font-mono">/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wider text-stone">{product.category.replace('-', ' ')}</td>
                  <td className="px-4 py-3 text-sm font-serif text-charcoal">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-xs text-stone">{product.sizes.join(', ')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {product.isFeatured && <span className="px-1.5 py-0.5 bg-warm-gold/20 text-warm-gold text-[9px] tracking-wider uppercase">Featured</span>}
                      {product.isNew && <span className="px-1.5 py-0.5 bg-charcoal/10 text-charcoal text-[9px] tracking-wider uppercase">New</span>}
                      {product.isBestseller && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] tracking-wider uppercase">Best</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${product.id}`} className="text-[10px] tracking-wider uppercase text-stone hover:text-charcoal transition-colors">
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id, product.name)}
                        className="text-[10px] tracking-wider uppercase text-stone hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
