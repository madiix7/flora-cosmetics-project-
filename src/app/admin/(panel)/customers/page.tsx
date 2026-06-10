'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'

type Customer = {
  phone: string
  name: string
  wilaya: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string
}

function buildCustomers(orders: Order[]): Customer[] {
  const map: Record<string, Customer> = {}
  for (const order of orders) {
    const { phone, fullName, wilaya } = order.customer
    if (!phone) continue
    if (!map[phone]) {
      map[phone] = { phone, name: fullName, wilaya, orderCount: 0, totalSpent: 0, lastOrderDate: order.createdAt }
    }
    map[phone].name = fullName
    map[phone].orderCount += 1
    if (order.status !== 'cancelled') map[phone].totalSpent += order.total
    if (order.createdAt > map[phone].lastOrderDate) map[phone].lastOrderDate = order.createdAt
  }
  return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent)
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json() as Promise<Order[]>
      })
      .then((orders) => {
        if (orders) { setCustomers(buildCustomers(orders)); setLoading(false) }
      })
      .catch(() => { setLoadError(true); setLoading(false) })
  }, [router])

  const visible = customers.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.wilaya.toLowerCase().includes(q)
  })

  const { topWilaya, repeatCount } = useMemo(() => {
    const wilayaFreq: Record<string, number> = {}
    for (const c of customers) wilayaFreq[c.wilaya] = (wilayaFreq[c.wilaya] ?? 0) + c.orderCount
    return {
      topWilaya: Object.entries(wilayaFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—',
      repeatCount: customers.filter((c) => c.orderCount > 1).length,
    }
  }, [customers])

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Overview</p>
          <h1 className="font-serif font-light text-3xl text-charcoal">Customers</h1>
        </div>
        <p className="text-sm text-stone">{customers.length} unique customers</p>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, gouvernorat…"
          className="bg-ivory border border-parchment px-4 py-2 text-sm text-charcoal placeholder:text-stone/50 outline-none focus:border-charcoal transition-colors rounded w-72"
        />
      </div>

      <div className="bg-ivory rounded border border-parchment overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-stone">Loading…</div>
        ) : loadError ? (
          <div className="p-12 text-center text-sm text-red-500">Failed to load data. Please refresh.</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone">
            {customers.length === 0 ? 'No customers yet. Customer data is built from placed orders.' : 'No customers match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-parchment bg-parchment/40">
                  {['Customer', 'Phone', 'Gouvernorat', 'Orders', 'Total Spent', 'Last Order'].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-[9px] tracking-widest uppercase text-stone font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment">
                {visible.map((c) => (
                  <tr key={c.phone} className="hover:bg-parchment/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm text-charcoal">{c.name}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-stone font-mono">{c.phone}</td>
                    <td className="px-5 py-4 text-sm text-stone">{c.wilaya}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-charcoal/5 text-charcoal text-xs rounded-full">
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-serif text-charcoal">{formatPrice(c.totalSpent)}</td>
                    <td className="px-5 py-4 text-xs text-stone">
                      {new Date(c.lastOrderDate).toLocaleDateString('fr-TN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {customers.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Total Customers', value: customers.length.toString() },
            { label: 'Repeat Customers', value: repeatCount.toString() },
            { label: 'Top Gouvernorat', value: topWilaya },
          ].map(({ label, value }) => (
            <div key={label} className="bg-ivory border border-parchment rounded p-4">
              <p className="text-[9px] tracking-widest uppercase text-stone mb-1">{label}</p>
              <p className="font-serif text-xl text-charcoal">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
