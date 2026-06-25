import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { CreateBrandDto } from './dto/create-brand.dto'

function toNormalized(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]/g, '')
}

function toSlug(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBrandDto) {
    const normalized = toNormalized(dto.name)
    const slug = toSlug(dto.name)

    const existing = await this.prisma.brand.findUnique({ where: { normalized } })
    if (existing) throw new ConflictException(`Brand already exists: ${existing.name}`)

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        normalized,
        country: dto.country,
        foundedYear: dto.foundedYear,
        websiteUrl: dto.websiteUrl,
        aliases: dto.aliases?.length
          ? {
              create: dto.aliases.map((a) => ({
                alias: a,
                normalized: toNormalized(a),
              })),
            }
          : undefined,
      },
      include: { aliases: true },
    })
  }

  async findAll() {
    return this.prisma.brand.findMany({ include: { aliases: true }, orderBy: { name: 'asc' } })
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id }, include: { aliases: true } })
    if (!brand) throw new NotFoundException('Brand not found')
    return brand
  }

  /** Resolve brand from name — checks canonical name then aliases */
  async resolve(rawName: string): Promise<string | null> {
    const norm = toNormalized(rawName)

    const brand = await this.prisma.brand.findUnique({ where: { normalized: norm } })
    if (brand) return brand.id

    const alias = await this.prisma.brandAlias.findUnique({ where: { normalized: norm } })
    return alias?.brandId ?? null
  }

  async delete(id: string) {
    await this.findOne(id)
    return this.prisma.brand.delete({ where: { id } })
  }
}
