'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { totalItems, openDrawer } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled || mobileOpen ? 'bg-ivory border-b border-parchment' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-serif font-light text-xl tracking-[0.25em] uppercase text-charcoal"
          >
            Flora
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={openDrawer}
              aria-label="Open cart"
              className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
            >
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 bg-charcoal text-ivory text-[9px] flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden flex flex-col gap-1.5 p-1"
            >
              <span className={`block w-5 h-px bg-charcoal transition-transform duration-200 ${mobileOpen ? 'translate-y-2.5 rotate-45' : ''}`} />
              <span className={`block w-5 h-px bg-charcoal transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-charcoal transition-transform duration-200 ${mobileOpen ? '-translate-y-2.5 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-ivory flex flex-col px-6 pt-8 pb-12 md:hidden">
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="font-serif font-light text-3xl text-charcoal"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
