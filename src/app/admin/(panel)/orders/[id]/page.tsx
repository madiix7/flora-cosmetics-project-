'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null }
        if (!r.ok) { setNotFound(true); return null }
        return r.json() as Promise<Order>
      })
      .then((data) => { if (data) setOrder(data) })
  }, [id, router])

  const updateStatus = async (status: OrderStatus) => {
    const original = order?.status
    setOrder((o) => o ? { ...o, status } : null)
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => null)
    if (!res?.ok && original) setOrder((o) => o ? { ...o, status: original } : null)
  }

  if (notFound) return <div className="text-sm text-stone p-8">Order not found.</div>
  if (!order) return <div className="text-sm text-stone">Loading…</div>

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors">
          ← Back
        </button>
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-0.5">Order</p>
          <h1 className="font-serif font-light text-2xl text-charcoal font-mono">{order.id}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left */}
        <div className="space-y-6">
          {/* Items */}
          <div className="bg-ivory rounded border border-parchment">
            <p className="px-6 py-4 border-b border-parchment text-[10px] tracking-widest uppercase text-charcoal">Items</p>
            <table className="w-full">
              <tbody className="divide-y divide-parchment">
                {order.items.map((item) => (
                  <tr key={`${item.product.id}-${item.size}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm text-charcoal font-serif">{item.product.name}</p>
                      <p className="text-[10px] tracking-wider text-stone uppercase">{item.size}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone text-center">×{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-charcoal text-right">{formatPrice(item.product.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-parchment flex justify-between">
              <span className="text-[10px] tracking-widest uppercase text-stone">Total</span>
              <span className="font-serif text-lg text-charcoal">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-ivory rounded border border-parchment p-6">
            <p className="text-[10px] tracking-widest uppercase text-charcoal mb-4">Customer</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-4"><span className="text-stone w-24">Name</span><span className="text-charcoal">{order.customer.fullName}</span></div>
              <div className="flex gap-4"><span className="text-stone w-24">Phone</span><span className="text-charcoal">{order.customer.phone}</span></div>
              <div className="flex gap-4"><span className="text-stone w-24">Gouvernorat</span><span className="text-charcoal">{order.customer.wilaya}</span></div>
              <div className="flex gap-4"><span className="text-stone w-24">Address</span><span className="text-charcoal">{order.customer.address}</span></div>
              {order.customer.notes && (
                <div className="flex gap-4"><span className="text-stone w-24">Notes</span><span className="text-charcoal">{order.customer.notes}</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-ivory rounded border border-parchment p-6">
            <p className="text-[10px] tracking-widest uppercase text-charcoal mb-4">Status</p>
            <span className={`inline-block px-3 py-1 text-[9px] tracking-widest uppercase rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
              {order.status}
            </span>
            <div className="mt-4 space-y-2">
              {(['pending', 'confirmed', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={order.status === s}
                  className={`w-full py-2 text-[10px] tracking-widest uppercase rounded transition-colors ${
                    order.status === s
                      ? 'bg-charcoal text-ivory cursor-default'
                      : 'border border-parchment text-stone hover:border-charcoal hover:text-charcoal'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-ivory rounded border border-parchment p-6">
            <p className="text-[10px] tracking-widest uppercase text-charcoal mb-3">Date</p>
            <p className="text-sm text-stone">{new Date(order.createdAt).toLocaleString('fr-TN')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
