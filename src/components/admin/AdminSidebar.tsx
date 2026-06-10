'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/admin/orders', label: 'Orders', icon: '◫' },
  { href: '/admin/customers', label: 'Customers', icon: '◎' },
  { href: '/admin/products', label: 'Products', icon: '⊞' },
  { href: '/admin/content', label: 'Content', icon: '✦' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  return (
    <aside className="w-56 shrink-0 bg-charcoal min-h-screen flex flex-col">
      <div className="px-6 py-8 border-b border-ivory/10">
        <p className="font-serif font-light text-lg tracking-[0.2em] uppercase text-ivory">Flora</p>
        <p className="text-[9px] tracking-widest uppercase text-ivory/30 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-xs tracking-wider rounded transition-colors',
              pathname.startsWith(href)
                ? 'bg-ivory/10 text-ivory'
                : 'text-ivory/50 hover:text-ivory hover:bg-ivory/5'
            )}
          >
            <span className="text-sm w-4 text-center">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-6 border-t border-ivory/10 space-y-1">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-wider text-ivory/50 hover:text-ivory hover:bg-ivory/5 rounded transition-colors"
        >
          <span className="text-sm w-4 text-center">↗</span>
          View Store
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs tracking-wider text-ivory/50 hover:text-red-400 hover:bg-ivory/5 rounded transition-colors text-left"
        >
          <span className="text-sm w-4 text-center">→</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
