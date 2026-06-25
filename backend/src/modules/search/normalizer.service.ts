import { Injectable } from '@nestjs/common'

const CONCENTRATION_ALIASES: Record<string, string> = {
  'eau de parfum': 'edp',
  'eau de perfum': 'edp',
  'eau de toilette': 'edt',
  'extrait de parfum': 'parfum',
  'extrait': 'parfum',
  'eau de cologne': 'edc',
  'cologne': 'edc',
}

@Injectable()
export class NormalizerService {
  normalize(input: string): string {
    let q = input
      .toLowerCase()
      // Remove accents
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      // Expand known concentration aliases before stripping words
      .replace(/\b(eau de parfum|eau de perfum|extrait de parfum|extrait|eau de toilette|eau de cologne|cologne)\b/g, (m) => CONCENTRATION_ALIASES[m] ?? m)
      // Strip volume measurements
      .replace(/\d+\s*(ml|oz|fl\.?\s*oz)\b/gi, '')
      // Strip punctuation except spaces
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return q
  }

  /** Normalize for database unique key comparison */
  normalizeForKey(input: string): string {
    return this.normalize(input).replace(/\s+/g, '')
  }
}
