'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const FILTERS: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'delivered', 'cancelled']

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false) })
  }, [])

  const visible = orders.filter((o) => {
    const matchesFilter = filter === 'all' || o.status === filter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.customer.wilaya.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const updateStatus = async (id: string, status: OrderStatus) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return
    await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Manage</p>
          <h1 className="font-serif font-light text-3xl text-charcoal">Orders</h1>
        </div>
        <p className="text-sm text-stone">{orders.length} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, wilaya…"
          className="bg-ivory border border-parchment px-4 py-2 text-sm text-charcoal placeholder:text-stone/50 outline-none focus:border-charcoal transition-colors rounded w-64"
        />
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] tracking-widest uppercase rounded transition-colors ${
                filter === f ? 'bg-charcoal text-ivory' : 'bg-ivory text-stone border border-parchment hover:border-charcoal'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ivory rounded border border-parchment overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-stone">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone">No orders match your filters.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-parchment bg-parchment/40">
                {['Order', 'Customer', 'Wilaya', 'Items', 'Total', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] tracking-widest uppercase text-stone font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment">
              {visible.map((order) => (
                <tr key={order.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="px-4 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs font-mono text-charcoal hover:text-warm-gold transition-colors">
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-charcoal">{order.customer.fullName}</p>
                    <p className="text-[10px] text-stone">{order.customer.phone}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-stone">{order.customer.wilaya}</td>
                  <td className="px-4 py-4 text-sm text-stone">{order.items.length}</td>
                  <td className="px-4 py-4 text-sm text-charcoal font-serif">{formatPrice(order.total)}</td>
                  <td className="px-4 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-[9px] tracking-wider uppercase px-2 py-1 rounded-full border-0 outline-none cursor-pointer font-medium ${STATUS_COLOR[order.status]}`}
                    >
                      {(['pending', 'confirmed', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-xs text-stone">
                    {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="text-[10px] tracking-wider text-stone hover:text-red-500 transition-colors uppercase"
                    >
                      Delete
                    </button>
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
