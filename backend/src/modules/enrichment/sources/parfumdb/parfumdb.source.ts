import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IFragranceSource, RawFragranceData } from '../fragrance-source.interface'

/**
 * Adapter for ParfumDB (or any licensed data provider).
 * Replace the API call structure to match your actual provider's contract.
 * See: https://parfumdb.com/api
 */
@Injectable()
export class ParfumDbSource implements IFragranceSource {
  readonly name = 'parfumdb'
  readonly priority = 1
  private readonly logger = new Logger(ParfumDbSource.name)

  constructor(private config: ConfigService) {}

  async search(query: string): Promise<RawFragranceData | null> {
    const apiKey = this.config.get<string>('PARFUMDB_API_KEY')
    const baseUrl = this.config.get<string>('PARFUMDB_API_URL')

    if (!apiKey || !baseUrl) {
      this.logger.warn('ParfumDB not configured — skipping')
      return null
    }

    const url = `${baseUrl}/search?q=${encodeURIComponent(query)}&limit=1`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      this.logger.warn(`ParfumDB returned ${res.status} for "${query}"`)
      return null
    }

    const data = await res.json() as { results?: RawParfumDbResult[] }
    const first = data.results?.[0]
    if (!first) return null

    return this.map(first)
  }

  private map(r: RawParfumDbResult): RawFragranceData {
    return {
      externalId: String(r.id),
      source: 'parfumdb',
      brandName: r.brand,
      name: r.name,
      concentration: r.concentration,
      gender: r.gender,
      releaseYear: r.year,
      description: r.description,
      imageUrl: r.image_url,
      topNotes: r.notes?.top ?? [],
      middleNotes: r.notes?.middle ?? [],
      baseNotes: r.notes?.base ?? [],
      accords: (r.accords ?? []).map((a) => ({ name: a.name, strength: a.strength })),
      families: r.families ?? [],
      aliases: r.aliases ?? [],
    }
  }
}

// Shape of ParfumDB API response — update to match actual provider
interface RawParfumDbResult {
  id: number
  brand: string
  name: string
  concentration?: string
  gender?: string
  year?: number
  description?: string
  image_url?: string
  notes?: { top: string[]; middle: string[]; base: string[] }
  accords?: { name: string; strength?: number }[]
  families?: string[]
  aliases?: string[]
}
