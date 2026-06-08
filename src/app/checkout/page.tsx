'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { calculateTotal, formatPrice, generateOrderId } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types'

type FormData = {
  fullName: string
  phone: string
  wilaya: string
  address: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.fullName.trim()) errors.fullName = 'Full name is required'
  if (!data.phone.trim()) errors.phone = 'Phone number is required'
  if (!data.wilaya.trim()) errors.wilaya = 'Wilaya is required'
  if (!data.address.trim()) errors.address = 'Delivery address is required'
  return errors
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const router = useRouter()
  const total = calculateTotal(items)

  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name as keyof FormData]) {
      setErrors({ ...errors, [e.target.name]: undefined })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const order: Order = {
      id: generateOrderId(),
      items,
      customer: form,
      total: total >= 5000 ? total : total + 500,
      createdAt: new Date().toISOString(),
    }

    const existing: Order[] = JSON.parse(localStorage.getItem('flora_orders') || '[]')
    localStorage.setItem('flora_orders', JSON.stringify([...existing, order]))
    localStorage.setItem('flora_last_order', JSON.stringify(order))

    clearCart()
    router.push('/order-confirmed')
  }

  const inputClass = (field: keyof FormData) =>
    `w-full bg-transparent border-b py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors ${
      errors[field] ? 'border-red-400' : 'border-parchment focus:border-charcoal'
    }`

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">Checkout</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-6">
              Delivery Information
            </p>
            <div className="space-y-6">
              <div>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full Name *"
                  className={inputClass('fullName')}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number *"
                  className={inputClass('phone')}
                />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <input
                  name="wilaya"
                  value={form.wilaya}
                  onChange={handleChange}
                  placeholder="Wilaya / City *"
                  className={inputClass('wilaya')}
                />
                {errors.wilaya && <p className="text-xs text-red-400 mt-1">{errors.wilaya}</p>}
              </div>
              <div>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Delivery Address *"
                  className={inputClass('address')}
                />
                {errors.address && (
                  <p className="text-xs text-red-400 mt-1">{errors.address}</p>
                )}
              </div>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Order Notes (optional)"
                rows={3}
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none resize-none transition-colors"
              />
            </div>
          </div>

          <div className="bg-parchment p-4">
            <p className="text-[10px] tracking-widest uppercase text-stone mb-2">
              Payment Method
            </p>
            <p className="text-sm text-charcoal">Cash on Delivery</p>
            <p className="text-xs text-stone mt-1">
              You pay when your order arrives. No card details required.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full justify-center">
            Place Order
          </Button>
        </form>

        <div className="bg-parchment p-8 h-fit sticky top-24">
          <p className="text-[10px] tracking-widest uppercase text-stone mb-6">Order Summary</p>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li key={`${item.product.id}-${item.size}`} className="flex gap-3">
                <div className="relative w-14 bg-sand shrink-0" style={{ height: '72px' }}>
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={56}
                    height={72}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal font-serif">{item.product.name}</p>
                  <p className="text-[10px] tracking-wider text-stone">{item.size} × {item.quantity}</p>
                </div>
                <p className="text-sm text-charcoal shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-sand pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone">Delivery</span>
              <span>{total >= 5000 ? 'Free' : formatPrice(500)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-widest uppercase text-stone">Total</span>
              <span className="font-serif text-xl text-charcoal">
                {formatPrice(total >= 5000 ? total : total + 500)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
