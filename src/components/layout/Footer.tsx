import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/70 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="font-serif font-light text-2xl tracking-[0.2em] uppercase text-ivory mb-4">
            Flora
          </p>
          <p className="text-xs leading-relaxed font-light max-w-xs">
            Artisan perfumes and cosmetics crafted with intention. Each fragrance is a
            carefully composed narrative.
          </p>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-ivory/40 mb-5">Navigate</p>
          <ul className="space-y-3">
            {[
              { href: '/shop', label: 'Shop' },
              { href: '/about', label: 'Our Story' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-xs tracking-wider hover:text-ivory transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-ivory/40 mb-5">Follow</p>
          <ul className="space-y-3">
            {[
              { href: '#', label: 'Instagram' },
              { href: '#', label: 'Facebook' },
              { href: '#', label: 'TikTok' },
            ].map(({ href, label }) => (
              <li key={label}>
                <a href={href} className="text-xs tracking-wider hover:text-ivory transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10 px-6 lg:px-12 py-6">
        <p className="text-[10px] tracking-widest uppercase text-ivory/30 text-center">
          © {new Date().getFullYear()} Flora Cosmetics — All rights reserved
        </p>
      </div>
    </footer>
  )
}
