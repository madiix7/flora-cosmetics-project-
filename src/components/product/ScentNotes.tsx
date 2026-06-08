import type { ScentNotes as ScentNotesType } from '@/types'

export function ScentNotes({ notes }: { notes: ScentNotesType }) {
  const rows: { label: string; items: string[] }[] = [
    { label: 'Top', items: notes.top },
    { label: 'Heart', items: notes.heart },
    { label: 'Base', items: notes.base },
  ].filter((r) => r.items.length > 0)

  if (rows.length === 0) return null

  return (
    <div className="space-y-3">
      {rows.map(({ label, items }) => (
        <div key={label} className="flex gap-4 items-baseline">
          <span className="text-[9px] tracking-widest uppercase text-stone w-10 shrink-0">
            {label}
          </span>
          <div className="flex flex-wrap gap-2">
            {items.map((note) => (
              <span key={note} className="text-xs text-charcoal px-3 py-1 bg-parchment">
                {note}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
