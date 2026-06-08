'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Get in Touch</p>
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">Contact</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-24 grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-8">Send a Message</p>
          {submitted ? (
            <div>
              <p className="font-serif text-2xl font-light text-charcoal mb-3">Thank you</p>
              <p className="text-sm text-stone">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your Name"
                required
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email Address"
                required
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your Message"
                required
                rows={5}
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none resize-none transition-colors"
              />
              <Button type="submit">Send Message</Button>
            </form>
          )}
        </div>

        <div className="space-y-10">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Visit Us</p>
            <p className="text-sm text-charcoal font-serif">Flora Cosmetics</p>
            <p className="text-sm text-stone mt-1">Rue Didouche Mourad, Algiers</p>
            <p className="text-sm text-stone">Algeria</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Hours</p>
            <p className="text-sm text-stone">Saturday – Thursday: 10:00 – 20:00</p>
            <p className="text-sm text-stone">Friday: Closed</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Reach Us</p>
            <p className="text-sm text-stone">+213 555 000 000</p>
            <p className="text-sm text-stone mt-1">hello@floracosmetics.dz</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Follow</p>
            <div className="flex gap-4">
              {['Instagram', 'Facebook', 'TikTok'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="text-xs tracking-wider text-stone hover:text-charcoal transition-colors"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
