'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'

export function Navbar() {
  const { totalItems, openDrawer } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-ivory border-b border-parchment' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif font-light text-xl tracking-[0.25em] uppercase text-charcoal"
        >
          Flora
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {[
            { href: '/shop', label: 'Shop' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={openDrawer}
          className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
        >
          <span>Cart</span>
          {totalItems > 0 && (
            <span className="w-5 h-5 bg-charcoal text-ivory text-[9px] flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
