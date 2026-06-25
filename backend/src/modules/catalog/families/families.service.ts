import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'

function toNormalized(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, '').trim()
}

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    const normalized = toNormalized(name)
    const existing = await this.prisma.fragranceFamily.findUnique({ where: { normalized } })
    if (existing) throw new ConflictException(`Family already exists: ${existing.name}`)
    return this.prisma.fragranceFamily.create({ data: { name, normalized } })
  }

  async findAll() {
    return this.prisma.fragranceFamily.findMany({ orderBy: { name: 'asc' } })
  }

  async resolveOrCreate(rawName: string): Promise<string> {
    const normalized = toNormalized(rawName)
    let family = await this.prisma.fragranceFamily.findUnique({ where: { normalized } })
    if (!family) family = await this.prisma.fragranceFamily.create({ data: { name: rawName, normalized } })
    return family.id
  }
}
