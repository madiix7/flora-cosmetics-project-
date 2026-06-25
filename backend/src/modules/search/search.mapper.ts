import { Perfume, Brand, PerfumeNote, Note, PerfumeAccord, Accord, PerfumeFamily, FragranceFamily } from '@prisma/client'
import { SearchResult } from './strategies/search-strategy.interface'

type PerfumeWithRelations = Perfume & {
  brand: Brand
  notes: (PerfumeNote & { note: Note & { canonical: Note | null } })[]
  accords: (PerfumeAccord & { accord: Accord })[]
  families: (PerfumeFamily & { family: FragranceFamily })[]
}

export function mapPerfume(
  p: PerfumeWithRelations,
  matchScore: number,
  matchType: SearchResult['matchType'],
): SearchResult {
  return {
    id: p.id,
    name: p.name,
    brand: { id: p.brand.id, name: p.brand.name },
    concentration: p.concentration,
    gender: p.gender,
    releaseYear: p.releaseYear,
    imageUrl: p.imageUrl,
    topNotes: p.notes
      .filter((n) => n.position === 'TOP')
      .map((n) => n.note.canonical?.name ?? n.note.name),
    middleNotes: p.notes
      .filter((n) => n.position === 'MIDDLE')
      .map((n) => n.note.canonical?.name ?? n.note.name),
    baseNotes: p.notes
      .filter((n) => n.position === 'BASE')
      .map((n) => n.note.canonical?.name ?? n.note.name),
    accords: p.accords.map((a) => ({
      name: a.accord.name,
      strength: a.strength ? Number(a.strength) : null,
    })),
    families: p.families.map((f) => ({
      name: f.family.name,
      isPrimary: f.isPrimary,
    })),
    slug: p.slug,
    matchScore,
    matchType,
  }
}
