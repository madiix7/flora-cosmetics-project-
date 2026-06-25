import { Concentration } from '@prisma/client'

const MAP: Record<string, Concentration> = {
  edp: 'EDP',
  'eau de parfum': 'EDP',
  'eau de perfum': 'EDP',
  edt: 'EDT',
  'eau de toilette': 'EDT',
  parfum: 'PARFUM',
  extrait: 'PARFUM',
  'extrait de parfum': 'PARFUM',
  'pure parfum': 'PARFUM',
  edc: 'EDC',
  'eau de cologne': 'EDC',
  cologne: 'EDC',
  elixir: 'ELIXIR',
}

export function normalizeConcentration(raw?: string): Concentration | undefined {
  if (!raw) return undefined
  const key = raw.toLowerCase().trim()
  return MAP[key] ?? 'OTHER'
}
