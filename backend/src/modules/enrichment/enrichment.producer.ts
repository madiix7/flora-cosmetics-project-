import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { createHash } from 'crypto'

export const ENRICHMENT_QUEUE = 'enrichment'

export interface EnrichmentJobData {
  dbJobId: string
  query: string
  normalizedQuery: string
}

@Injectable()
export class EnrichmentProducer {
  constructor(@InjectQueue(ENRICHMENT_QUEUE) private queue: Queue<EnrichmentJobData>) {}

  async enqueue(dbJobId: string, query: string, normalizedQuery: string): Promise<string> {
    const jobKey = createHash('sha256').update(normalizedQuery).digest('hex')

    await this.queue.add(
      'enrich-fragrance',
      { dbJobId, query, normalizedQuery },
      {
        jobId: jobKey,
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 86400 },
        removeOnFail: false,
      },
    )

    return jobKey
  }
}
