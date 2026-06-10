import Link from 'next/link'

function isSafeUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

type FooterProps = {
  instagram?: string
  facebook?: string
  tiktok?: string
  storeTagline?: string
}

export function Footer({ instagram, facebook, tiktok, storeTagline }: FooterProps) {
  const socials = [
    { label: 'Instagram', href: instagram },
    { label: 'Facebook', href: facebook },
    { label: 'TikTok', href: tiktok },
  ].filter((s): s is { label: string; href: string } => !!s.href && isSafeUrl(s.href))

  return (
    <footer className="bg-charcoal text-ivory/70 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="font-serif font-light text-2xl tracking-[0.2em] uppercase text-ivory mb-4">
            Flora
          </p>
          <p className="text-xs leading-relaxed font-light max-w-xs">
            {storeTagline || 'Artisan perfumes and cosmetics crafted with intention. Each fragrance is a carefully composed narrative.'}
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
          {socials.length > 0 ? (
            <ul className="space-y-3">
              {socials.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs tracking-wider hover:text-ivory transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ivory/30">Links coming soon</p>
          )}
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
