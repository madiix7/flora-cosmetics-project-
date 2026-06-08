'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function OrderConfirmedPage() {
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('flora_last_order')
    if (stored) setOrder(JSON.parse(stored))
  }, [])

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 bg-parchment rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="font-serif font-light text-4xl text-charcoal mb-4">Order Placed</h1>
        <div className="w-8 h-px bg-warm-gold mx-auto mb-6" />
        <p className="text-sm text-stone leading-relaxed mb-8">
          Thank you for your order. We will contact you shortly on the number provided to confirm
          your delivery details. Cash on delivery — you pay when it arrives.
        </p>

        {order && (
          <div className="bg-parchment p-8 text-left mb-8">
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">
              Order #{order.id}
            </p>
            <ul className="space-y-3 mb-6">
              {order.items.map((item) => (
                <li key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-charcoal">
                    {item.product.name} ({item.size}) × {item.quantity}
                  </span>
                  <span className="text-stone">{formatPrice(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-sand pt-4 flex justify-between">
              <span className="text-[10px] tracking-widest uppercase text-stone">Total</span>
              <span className="font-serif text-lg text-charcoal">{formatPrice(order.total)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-sand">
              <p className="text-xs text-stone">Delivering to: {order.customer.address}, {order.customer.wilaya}</p>
              <p className="text-xs text-stone mt-1">Contact: {order.customer.phone}</p>
            </div>
          </div>
        )}

        <Link href="/shop">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
