import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ISearchStrategy, SearchResult } from './search-strategy.interface'
import { mapPerfume } from '../search.mapper'
import { perfumeInclude } from './exact.strategy'

const SIMILARITY_THRESHOLD = 0.25

@Injectable()
export class PgTrgmStrategy implements ISearchStrategy {
  constructor(private prisma: PrismaService) {}

  async search(query: string, limit: number, offset: number): Promise<SearchResult[]> {
    // Requires pg_trgm extension installed (see init.sql)
    const rows = await this.prisma.$queryRaw<{ id: string; similarity: number }[]>`
      SELECT id, similarity(normalized_name, ${query}) AS similarity
      FROM perfumes
      WHERE similarity(normalized_name, ${query}) > ${SIMILARITY_THRESHOLD}
      ORDER BY similarity DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    if (rows.length === 0) return []

    const ids = rows.map((r) => r.id)
    const simById = Object.fromEntries(rows.map((r) => [r.id, r.similarity]))

    const perfumes = await this.prisma.perfume.findMany({
      where: { id: { in: ids } },
      include: perfumeInclude,
    })

    return perfumes
      .map((p) => mapPerfume(p, simById[p.id] ?? 0.3, 'trigram'))
      .sort((a, b) => b.matchScore - a.matchScore)
  }
}
