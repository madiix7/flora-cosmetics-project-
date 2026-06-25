import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'

function toNormalized(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, '').trim()
}

@Injectable()
export class AccordsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    const normalized = toNormalized(name)
    const existing = await this.prisma.accord.findUnique({ where: { normalized } })
    if (existing) throw new ConflictException(`Accord already exists: ${existing.name}`)
    return this.prisma.accord.create({ data: { name, normalized } })
  }

  async findAll() {
    return this.prisma.accord.findMany({ orderBy: { name: 'asc' } })
  }

  async resolveOrCreate(rawName: string): Promise<string> {
    const normalized = toNormalized(rawName)
    let accord = await this.prisma.accord.findUnique({ where: { normalized } })
    if (!accord) accord = await this.prisma.accord.create({ data: { name: rawName, normalized } })
    return accord.id
  }
}
