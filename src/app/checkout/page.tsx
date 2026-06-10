'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { calculateTotal, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types'

const GOUVERNORATS = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte',
  'Gabès', 'Gafsa', 'Jendouba', 'Kairouan',
  'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
  'Manouba', 'Médenine', 'Monastir', 'Nabeul',
  'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
  'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
]

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
  if (!data.wilaya.trim()) errors.wilaya = 'Gouvernorat is required'
  if (!data.address.trim()) errors.address = 'Delivery address is required'
  return errors
}

export default function CheckoutPage() {
  const { items, clearCart, freeDeliveryThreshold, deliveryFee, isLoaded } = useCart()
  const router = useRouter()
  const total = calculateTotal(items)
  const delivery = total >= freeDeliveryThreshold ? 0 : deliveryFee

  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    if (isLoaded && items.length === 0 && !submitting) router.replace('/cart')
  }, [items.length, isLoaded, submitting, router])

  if (!isLoaded) return null
  if (orderSuccess) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name as keyof FormData]) {
      setErrors({ ...errors, [e.target.name]: undefined })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (items.length === 0) {
      router.push('/cart')
      return
    }
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customer: form, total: total + delivery }),
    }).catch(() => null)

    if (!res?.ok) {
      setSubmitError('Failed to place order. Please try again.')
      setSubmitting(false)
      return
    }

    const savedOrder = await res.json() as Order
    localStorage.setItem('flora_last_order', JSON.stringify(savedOrder))
    setOrderSuccess(true)
    clearCart()
    router.push('/order-confirmed')
  }

  const fieldBorder = (field: keyof FormData) =>
    errors[field] ? 'border-red-400' : 'border-parchment focus:border-charcoal'

  const inputClass = (field: keyof FormData) =>
    `w-full bg-transparent border-b py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors ${fieldBorder(field)}`

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
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number * (+216 XX XXX XXX)"
                  className={inputClass('phone')}
                />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <select
                  name="wilaya"
                  value={form.wilaya}
                  onChange={handleChange}
                  className={`w-full bg-transparent border-b py-3 text-sm outline-none transition-colors appearance-none cursor-pointer ${fieldBorder('wilaya')} ${!form.wilaya ? 'text-stone/50' : 'text-charcoal'}`}
                >
                  <option value="" disabled>Gouvernorat *</option>
                  {GOUVERNORATS.map((g) => (
                    <option key={g} value={g} className="text-charcoal bg-white">{g}</option>
                  ))}
                </select>
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
                {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address}</p>}
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
            <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Payment Method</p>
            <p className="text-sm text-charcoal">Cash on Delivery</p>
            <p className="text-xs text-stone mt-1">You pay when your order arrives. No card details required.</p>
          </div>

          {submitError && <p className="text-xs text-red-400">{submitError}</p>}

          <Button type="submit" disabled={submitting} size="lg" className="w-full justify-center">
            {submitting ? 'Placing order…' : 'Place Order'}
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
              <span>{delivery === 0 ? 'Free' : formatPrice(delivery)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-widest uppercase text-stone">Total</span>
              <span className="font-serif text-xl text-charcoal">{formatPrice(total + delivery)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
