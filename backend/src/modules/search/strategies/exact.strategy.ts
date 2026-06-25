import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ISearchStrategy, SearchResult } from './search-strategy.interface'
import { mapPerfume } from '../search.mapper'

@Injectable()
export class ExactStrategy implements ISearchStrategy {
  constructor(private prisma: PrismaService) {}

  async search(query: string, limit: number, offset: number): Promise<SearchResult[]> {
    const perfumes = await this.prisma.perfume.findMany({
      where: { normalizedName: { contains: query } },
      take: limit,
      skip: offset,
      include: perfumeInclude,
    })
    return perfumes.map((p) => mapPerfume(p, 1.0, 'exact'))
  }
}

export const perfumeInclude = {
  brand: true,
  notes: { include: { note: { include: { canonical: true } } } },
  accords: { include: { accord: true } },
  families: { include: { family: true } },
} as const
