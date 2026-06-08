'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

type AccordionItem = {
  title: string
  content: React.ReactNode
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-parchment">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span className="text-[11px] tracking-widest uppercase font-sans text-charcoal">
              {item.title}
            </span>
            <span className="text-stone text-lg leading-none">
              {open === i ? '−' : '+'}
            </span>
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              open === i ? 'max-h-96 pb-4' : 'max-h-0'
            )}
          >
            <div className="text-sm text-stone leading-relaxed font-light">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
