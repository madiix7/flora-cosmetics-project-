import { Gender } from '@prisma/client'

const MAP: Record<string, Gender> = {
  masculine: 'MASCULINE',
  male: 'MASCULINE',
  men: 'MASCULINE',
  'for men': 'MASCULINE',
  homme: 'MASCULINE',
  feminine: 'FEMININE',
  female: 'FEMININE',
  women: 'FEMININE',
  'for women': 'FEMININE',
  femme: 'FEMININE',
  unisex: 'UNISEX',
  shared: 'UNISEX',
  'for all': 'UNISEX',
}

export function normalizeGender(raw?: string): Gender | undefined {
  if (!raw) return undefined
  return MAP[raw.toLowerCase().trim()] ?? 'UNISEX'
}
