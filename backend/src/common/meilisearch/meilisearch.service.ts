import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MeiliSearch, Index } from 'meilisearch'

export const PERFUMES_INDEX = 'perfumes'

export interface PerfumeDocument {
  id: string
  name: string
  normalizedName: string
  brandId: string
  brandName: string
  brandNormalized: string
  concentration: string | null
  gender: string | null
  releaseYear: number | null
  aliases: string[]
  slug: string
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name)
  private client: MeiliSearch
  private index: Index<PerfumeDocument>

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    this.client = new MeiliSearch({
      host: this.config.get<string>('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: this.config.get<string>('MEILISEARCH_API_KEY', ''),
    })

    try {
      this.index = await this.client.getIndex<PerfumeDocument>(PERFUMES_INDEX)
    } catch {
      this.index = await this.client.createIndex(PERFUMES_INDEX, { primaryKey: 'id' })
    }

    await this.configureIndex()
    this.logger.log('Meilisearch index ready')
  }

  private async configureIndex() {
    await this.index.updateSettings({
      searchableAttributes: ['name', 'brandName', 'aliases', 'normalizedName', 'brandNormalized'],
      filterableAttributes: ['concentration', 'gender', 'brandId'],
      sortableAttributes: ['releaseYear'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
    })
  }

  async upsert(doc: PerfumeDocument): Promise<void> {
    await this.index.addDocuments([doc])
  }

  async upsertBatch(docs: PerfumeDocument[]): Promise<void> {
    if (docs.length === 0) return
    await this.index.addDocuments(docs)
  }

  async delete(id: string): Promise<void> {
    await this.index.deleteDocument(id)
  }

  async search(
    query: string,
    options?: { filter?: string; limit?: number; offset?: number },
  ): Promise<PerfumeDocument[]> {
    const result = await this.index.search(query, {
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
      filter: options?.filter,
    })
    return result.hits
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.health()
      return true
    } catch {
      return false
    }
  }
}
