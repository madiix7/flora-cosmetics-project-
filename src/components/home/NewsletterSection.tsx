'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="bg-parchment py-20 px-6 text-center">
      <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Stay in the know</p>
      <h2 className="font-serif font-light text-2xl md:text-3xl text-charcoal mb-3">
        New arrivals, first.
      </h2>
      <p className="text-sm text-stone font-light mb-8 max-w-sm mx-auto">
        Subscribe to receive early access to new collections and exclusive offers.
      </p>
      {submitted ? (
        <p className="text-sm text-warm-gold tracking-wider">Thank you — we&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 bg-ivory border border-sand px-4 py-3 text-sm text-charcoal placeholder:text-stone/60 outline-none focus:border-charcoal transition-colors"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      )}
    </section>
  )
}
