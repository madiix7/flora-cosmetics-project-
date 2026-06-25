import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateNoteDto {
  @IsString()
  @MaxLength(150)
  name!: string

  @IsOptional()
  @IsString()
  canonicalId?: string
}

function toNormalized(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, '').trim()
}

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNoteDto) {
    const normalized = toNormalized(dto.name)
    const existing = await this.prisma.note.findUnique({ where: { normalized } })
    if (existing) throw new ConflictException(`Note already exists: ${existing.name}`)

    return this.prisma.note.create({
      data: { name: dto.name, normalized, canonicalId: dto.canonicalId ?? null },
    })
  }

  async findAll() {
    return this.prisma.note.findMany({
      include: { canonical: true },
      orderBy: { name: 'asc' },
    })
  }

  /** Resolve note name to a note id, creating it if missing */
  async resolveOrCreate(rawName: string): Promise<string> {
    const normalized = toNormalized(rawName)
    let note = await this.prisma.note.findUnique({ where: { normalized } })
    if (!note) {
      note = await this.prisma.note.create({
        data: { name: rawName, normalized },
      })
    }
    // If it's a variant, return canonical; otherwise return self
    return note.canonicalId ?? note.id
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } })
    if (!note) throw new NotFoundException('Note not found')
    return note
  }
}
