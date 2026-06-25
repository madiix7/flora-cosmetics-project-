'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    fetch('/api/orders', { cache: 'no-store' })
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json() as Promise<Order[]>
      })
      .then((data) => { if (data) { setOrders(data); setLoading(false) } })
      .catch(() => { setLoadError(true); setLoading(false) })
  }, [router])

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

  const showActionError = (msg: string) => {
    setActionError(msg)
    setTimeout(() => setActionError(''), 4000)
  }

  const updateStatus = async (id: string, status: OrderStatus) => {
    const original = orders.find((o) => o.id === id)?.status
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => null)
    if (!res?.ok && original) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: original } : o)))
      showActionError('Failed to update status. Changes reverted.')
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' }).catch(() => null)
    if (res?.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } else {
      showActionError('Failed to delete order. Please try again.')
    }
  }

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Customer', 'Phone', 'Gouvernorat', 'Address', 'Items', 'Total', 'Status', 'Date'],
      ...orders.map((o) => [
        o.id,
        o.customer.fullName,
        o.customer.phone,
        o.customer.wilaya,
        o.customer.address,
        o.items.map((i) => `${i.product.name} x${i.quantity}`).join('; '),
        o.total.toString(),
        o.status,
        new Date(o.createdAt).toLocaleDateString('fr-TN'),
      ]),
    ]
    const sanitize = (cell: unknown) =>
      String(cell).replace(/\r?\n/g, ' ').replace(/"/g, '""')
    const csv = rows.map((r) => r.map((cell) => `"${sanitize(cell)}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flora-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Manage</p>
          <h1 className="font-serif font-light text-3xl text-charcoal">Orders</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-stone">{orders.length} total</p>
          {orders.length > 0 && (
            <button
              onClick={exportCSV}
              className="border border-parchment text-stone px-4 py-2 text-[10px] tracking-widest uppercase hover:border-charcoal hover:text-charcoal transition-colors rounded"
            >
              ↓ Export CSV
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, gouvernorat…"
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
        ) : loadError ? (
          <div className="p-12 text-center text-sm text-red-500">Failed to load orders. Please refresh.</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone">No orders match your filters.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-parchment bg-parchment/40">
                {['Order', 'Customer', 'Gouvernorat', 'Items', 'Total', 'Status', 'Date', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[9px] tracking-widest uppercase text-stone font-normal">
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
                    {new Date(order.createdAt).toLocaleDateString('fr-TN')}
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
