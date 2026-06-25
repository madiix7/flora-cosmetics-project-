import { Module } from '@nestjs/common'
import { SearchService } from './search.service'
import { NormalizerService } from './normalizer.service'
import { ExactStrategy } from './strategies/exact.strategy'
import { AliasStrategy } from './strategies/alias.strategy'
import { MeilisearchStrategy } from './strategies/meilisearch.strategy'
import { PgTrgmStrategy } from './strategies/pg-trgm.strategy'

@Module({
  providers: [
    SearchService,
    NormalizerService,
    ExactStrategy,
    AliasStrategy,
    MeilisearchStrategy,
    PgTrgmStrategy,
  ],
  exports: [SearchService, NormalizerService],
})
export class SearchModule {}
