import { Injectable, Logger } from '@nestjs/common'
import { RedisService } from '../../common/redis/redis.service'
import { NormalizerService } from './normalizer.service'
import { ExactStrategy } from './strategies/exact.strategy'
import { AliasStrategy } from './strategies/alias.strategy'
import { MeilisearchStrategy } from './strategies/meilisearch.strategy'
import { PgTrgmStrategy } from './strategies/pg-trgm.strategy'
import { SearchResult } from './strategies/search-strategy.interface'

const CACHE_TTL = 300  // 5 minutes

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name)

  constructor(
    private redis: RedisService,
    private normalizer: NormalizerService,
    private exact: ExactStrategy,
    private alias: AliasStrategy,
    private meili: MeilisearchStrategy,
    private trgm: PgTrgmStrategy,
  ) {}

  async search(
    rawQuery: string,
    limit = 10,
    offset = 0,
  ): Promise<{ results: SearchResult[]; enrichmentAvailable: boolean }> {
    const q = this.normalizer.normalize(rawQuery)
    const cacheKey = `search:${q}:${limit}:${offset}`

    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached) as { results: SearchResult[]; enrichmentAvailable: boolean }
    }

    // Strategy chain — short-circuit on first non-empty result
    let results: SearchResult[] = []

    results = await this.exact.search(q, limit, offset)

    if (results.length === 0) {
      results = await this.alias.search(q, limit, offset)
    }

    if (results.length === 0) {
      try {
        results = await this.meili.search(q, limit, offset)
      } catch (err) {
        this.logger.warn('Meilisearch unavailable, falling back to pg_trgm', err)
        results = await this.trgm.search(q, limit, offset)
      }
    }

    const payload = {
      results,
      enrichmentAvailable: results.length === 0,
    }

    await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(payload))
    return payload
  }

  /** Invalidate search cache for a specific normalized name (called after enrichment) */
  async invalidate(normalizedName: string) {
    await this.redis.delPattern(`search:*${normalizedName}*`)
  }
}
