import { cn } from '@/lib/cn'

type BadgeProps = {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase font-sans bg-charcoal text-ivory',
        className
      )}
    >
      {children}
    </span>
  )
}
