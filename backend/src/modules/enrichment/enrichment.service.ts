import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { createHash } from 'crypto'
import { PrismaService } from '../../common/prisma/prisma.service'
import { NormalizerService } from '../search/normalizer.service'
import { EnrichmentProducer } from './enrichment.producer'

@Injectable()
export class EnrichmentService {
  constructor(
    private prisma: PrismaService,
    private normalizer: NormalizerService,
    private producer: EnrichmentProducer,
  ) {}

  async createJob(query: string, vendorId: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('query must be at least 2 characters')
    }

    const normalizedQuery = this.normalizer.normalize(query)
    const idempotencyKey = createHash('sha256').update(normalizedQuery).digest('hex')

    // Return existing job if it already exists (idempotent)
    const existing = await this.prisma.enrichmentJob.findUnique({
      where: { idempotencyKey },
    })
    if (existing) {
      return { jobId: existing.id, status: existing.status, perfumeId: existing.perfumeId, isNew: false }
    }

    // Create DB record first, then enqueue
    const job = await this.prisma.enrichmentJob.create({
      data: {
        idempotencyKey,
        query,
        normalizedQuery,
        vendorId,
        status: 'PENDING',
      },
    })

    await this.producer.enqueue(job.id, query, normalizedQuery)

    return {
      jobId: job.id,
      status: 'PENDING',
      perfumeId: null,
      isNew: true,
      message: 'We are importing this fragrance. Please check back in a few minutes.',
      pollUrl: `/enrichment/jobs/${job.id}`,
    }
  }

  async getJob(jobId: string, vendorId: string) {
    const job = await this.prisma.enrichmentJob.findUnique({ where: { id: jobId } })
    if (!job) throw new NotFoundException('Job not found')

    // Vendors can only see their own jobs (admins see all)
    if (job.vendorId && job.vendorId !== vendorId) {
      throw new ForbiddenException('Access denied')
    }

    return {
      id: job.id,
      query: job.query,
      status: job.status,
      perfumeId: job.perfumeId,
      attempts: job.attempts,
      lastError: job.lastError,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    }
  }
}
