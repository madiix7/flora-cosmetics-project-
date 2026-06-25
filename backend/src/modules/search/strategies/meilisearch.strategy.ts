import { Injectable } from '@nestjs/common'
import { MeilisearchService } from '../../../common/meilisearch/meilisearch.service'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ISearchStrategy, SearchResult } from './search-strategy.interface'
import { mapPerfume } from '../search.mapper'
import { perfumeInclude } from './exact.strategy'

@Injectable()
export class MeilisearchStrategy implements ISearchStrategy {
  constructor(
    private meilisearch: MeilisearchService,
    private prisma: PrismaService,
  ) {}

  async search(query: string, limit: number, offset: number): Promise<SearchResult[]> {
    const hits = await this.meilisearch.search(query, { limit, offset })
    if (hits.length === 0) return []

    const ids = hits.map((h) => h.id)
    const perfumes = await this.prisma.perfume.findMany({
      where: { id: { in: ids } },
      include: perfumeInclude,
    })

    // Preserve Meilisearch ranking order
    const byId = Object.fromEntries(perfumes.map((p) => [p.id, p]))
    return ids
      .filter((id) => byId[id])
      .map((id, i) => mapPerfume(byId[id], Math.max(0.9 - i * 0.01, 0.5), 'fuzzy'))
  }
}
