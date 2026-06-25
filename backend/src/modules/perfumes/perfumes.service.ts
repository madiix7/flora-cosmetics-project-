import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { MeilisearchService, PerfumeDocument } from '../../common/meilisearch/meilisearch.service'
import { RedisService } from '../../common/redis/redis.service'
import { Concentration, Gender, NotePosition } from '@prisma/client'
import { mapPerfume } from '../search/search.mapper'
import { perfumeInclude } from '../search/strategies/exact.strategy'

export interface CreatePerfumeData {
  brandId: string
  name: string
  normalizedName: string
  concentration?: Concentration
  gender?: Gender
  releaseYear?: number
  description?: string
  imageUrl?: string
  externalId?: string
  source?: string
  slug: string
  notes?: { noteId: string; position: NotePosition }[]
  accords?: { accordId: string; strength?: number }[]
  familyIds?: string[]
  aliases?: string[]
}

const PERFUME_CACHE_TTL = 3600  // 1 hour

@Injectable()
export class PerfumesService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
    private redis: RedisService,
  ) {}

  async create(data: CreatePerfumeData) {
    const perfume = await this.prisma.perfume.create({
      data: {
        brandId: data.brandId,
        name: data.name,
        normalizedName: data.normalizedName,
        concentration: data.concentration,
        gender: data.gender,
        releaseYear: data.releaseYear,
        description: data.description,
        imageUrl: data.imageUrl,
        externalId: data.externalId,
        source: data.source,
        slug: data.slug,
        notes: data.notes?.length
          ? { createMany: { data: data.notes } }
          : undefined,
        accords: data.accords?.length
          ? { createMany: { data: data.accords.map((a) => ({ accordId: a.accordId, strength: a.strength })) } }
          : undefined,
        families: data.familyIds?.length
          ? { createMany: { data: data.familyIds.map((id, i) => ({ familyId: id, isPrimary: i === 0 })) } }
          : undefined,
        aliases: data.aliases?.length
          ? {
              createMany: {
                data: data.aliases.map((a) => ({
                  alias: a,
                  normalized: a.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, '').trim(),
                })),
              },
            }
          : undefined,
      },
      include: perfumeInclude,
    })

    await this.syncToMeilisearch(perfume)
    return perfume
  }

  async findById(id: string) {
    const cacheKey = `perfume:${id}`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const perfume = await this.prisma.perfume.findUnique({
      where: { id },
      include: perfumeInclude,
    })
    if (!perfume) throw new NotFoundException('Perfume not found')

    const mapped = mapPerfume(perfume, 1.0, 'exact')
    await this.redis.setex(cacheKey, PERFUME_CACHE_TTL, JSON.stringify(mapped))
    return mapped
  }

  async findByIdentity(
    brandId: string,
    normalizedName: string,
    concentration?: Concentration | null,
  ) {
    return this.prisma.perfume.findFirst({
      where: {
        brandId,
        normalizedName,
        concentration: concentration ?? undefined,
      },
      include: perfumeInclude,
    })
  }

  private async syncToMeilisearch(perfume: Awaited<ReturnType<typeof this.prisma.perfume.findUnique>> & Record<string, unknown>) {
    if (!perfume) return
    const p = perfume as Parameters<typeof mapPerfume>[0]
    const doc: PerfumeDocument = {
      id: p.id,
      name: p.name,
      normalizedName: p.normalizedName,
      brandId: p.brandId,
      brandName: p.brand?.name ?? '',
      brandNormalized: p.brand?.normalized ?? '',
      concentration: p.concentration ?? null,
      gender: p.gender ?? null,
      releaseYear: p.releaseYear ?? null,
      aliases: [],
      slug: p.slug,
    }
    await this.meilisearch.upsert(doc)
  }
}
