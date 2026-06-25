import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ISearchStrategy, SearchResult } from './search-strategy.interface'
import { mapPerfume } from '../search.mapper'
import { perfumeInclude } from './exact.strategy'

@Injectable()
export class AliasStrategy implements ISearchStrategy {
  constructor(private prisma: PrismaService) {}

  async search(query: string, limit: number, offset: number): Promise<SearchResult[]> {
    const aliases = await this.prisma.perfumeAlias.findMany({
      where: { normalized: { contains: query } },
      take: limit,
      skip: offset,
      include: { perfume: { include: perfumeInclude } },
    })

    return aliases.map((a) => mapPerfume(a.perfume, 0.95, 'alias'))
  }
}
