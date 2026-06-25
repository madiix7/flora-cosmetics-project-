import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { MeilisearchService, PerfumeDocument } from '../../../common/meilisearch/meilisearch.service'
import { PerfumesService } from '../../perfumes/perfumes.service'
import { BrandsService } from '../../catalog/brands/brands.service'
import { NotesService } from '../../catalog/notes/notes.service'
import { AccordsService } from '../../catalog/accords/accords.service'
import { FamiliesService } from '../../catalog/families/families.service'
import { IFragranceSource } from '../sources/fragrance-source.interface'
import { ParfumDbSource } from '../sources/parfumdb/parfumdb.source'
import { normalizeConcentration } from '../normalizer/concentration.normalizer'
import { normalizeGender } from '../normalizer/gender.normalizer'
import { NormalizerService } from '../../search/normalizer.service'
import { ENRICHMENT_QUEUE, EnrichmentJobData } from '../enrichment.producer'
import { NotePosition } from '@prisma/client'

function toSlug(brand: string, name: string, concentration?: string): string {
  const parts = [brand, name, concentration].filter(Boolean).join(' ')
  return parts.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

@Processor(ENRICHMENT_QUEUE, { concurrency: 3 })
export class EnrichmentWorker extends WorkerHost {
  private readonly logger = new Logger(EnrichmentWorker.name)
  private readonly sources: IFragranceSource[]

  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
    private perfumes: PerfumesService,
    private brands: BrandsService,
    private notes: NotesService,
    private accords: AccordsService,
    private families: FamiliesService,
    private normalizer: NormalizerService,
    private parfumDb: ParfumDbSource,
  ) {
    super()
    this.sources = [parfumDb].sort((a, b) => a.priority - b.priority)
  }

  async process(job: Job<EnrichmentJobData>): Promise<void> {
    const { dbJobId, normalizedQuery } = job.data
    this.logger.log(`Processing enrichment job ${dbJobId} for "${normalizedQuery}"`)

    await this.prisma.enrichmentJob.update({
      where: { id: dbJobId },
      data: { status: 'PROCESSING', attempts: { increment: 1 } },
    })

    try {
      // 1. Try each source in priority order
      let raw = null
      for (const source of this.sources) {
        raw = await source.search(normalizedQuery)
        if (raw) break
      }
      if (!raw) throw new Error('No data returned from any source')

      // 2. Resolve brand (create if new)
      let brandId = await this.brands.resolve(raw.brandName)
      if (!brandId) {
        const brand = await this.brands.create({ name: raw.brandName })
        brandId = brand.id
      }

      // 3. Normalize concentration + gender
      const concentration = normalizeConcentration(raw.concentration)
      const gender = normalizeGender(raw.gender)
      const normalizedName = this.normalizer.normalize(raw.name)
      const slug = toSlug(raw.brandName, raw.name, concentration)

      // 4. Dedup check before insert
      const existing = await this.perfumes.findByIdentity(brandId, normalizedName, concentration)
      let perfume = existing

      if (!perfume) {
        // 5. Resolve notes
        const noteData: { noteId: string; position: NotePosition }[] = []
        for (const n of raw.topNotes ?? []) {
          noteData.push({ noteId: await this.notes.resolveOrCreate(n), position: 'TOP' })
        }
        for (const n of raw.middleNotes ?? []) {
          noteData.push({ noteId: await this.notes.resolveOrCreate(n), position: 'MIDDLE' })
        }
        for (const n of raw.baseNotes ?? []) {
          noteData.push({ noteId: await this.notes.resolveOrCreate(n), position: 'BASE' })
        }

        // 6. Resolve accords
        const accordData: { accordId: string; strength?: number }[] = []
        for (const a of raw.accords ?? []) {
          accordData.push({ accordId: await this.accords.resolveOrCreate(a.name), strength: a.strength })
        }

        // 7. Resolve families
        const familyIds: string[] = []
        for (const f of raw.families ?? []) {
          familyIds.push(await this.families.resolveOrCreate(f))
        }

        perfume = await this.perfumes.create({
          brandId,
          name: raw.name,
          normalizedName,
          concentration,
          gender,
          releaseYear: raw.releaseYear,
          description: raw.description,
          imageUrl: raw.imageUrl,
          externalId: raw.externalId,
          source: raw.source,
          slug,
          notes: noteData,
          accords: accordData,
          familyIds,
          aliases: raw.aliases,
        })
      }

      // 8. Mark job COMPLETED
      await this.prisma.enrichmentJob.update({
        where: { id: dbJobId },
        data: { status: 'COMPLETED', perfumeId: perfume.id, completedAt: new Date() },
      })

      this.logger.log(`Enrichment completed for "${normalizedQuery}" → perfume ${perfume.id}`)
    } catch (err) {
      const isFinalAttempt = job.attemptsMade >= (job.opts.attempts ?? 5) - 1
      const errorMsg = err instanceof Error ? err.message : String(err)

      await this.prisma.enrichmentJob.update({
        where: { id: dbJobId },
        data: {
          status: isFinalAttempt ? 'DEAD_LETTER' : 'FAILED',
          lastError: errorMsg,
        },
      })

      if (isFinalAttempt) {
        this.logger.error(`Job ${dbJobId} exhausted all retries — moved to DEAD_LETTER`, errorMsg)
        // TODO: Send alert (email/Slack webhook) when job hits DEAD_LETTER
      }

      throw err  // rethrow so BullMQ handles exponential backoff
    }
  }
}
