import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { EnrichmentController } from './enrichment.controller'
import { EnrichmentService } from './enrichment.service'
import { EnrichmentProducer, ENRICHMENT_QUEUE } from './enrichment.producer'
import { EnrichmentWorker } from './workers/enrichment.worker'
import { ParfumDbSource } from './sources/parfumdb/parfumdb.source'
import { SearchModule } from '../search/search.module'
import { CatalogModule } from '../catalog/catalog.module'
import { PerfumesModule } from '../perfumes/perfumes.module'

@Module({
  imports: [
    BullModule.registerQueue({ name: ENRICHMENT_QUEUE }),
    SearchModule,
    CatalogModule,
    PerfumesModule,
  ],
  providers: [
    EnrichmentService,
    EnrichmentProducer,
    EnrichmentWorker,
    ParfumDbSource,
  ],
  controllers: [EnrichmentController],
})
export class EnrichmentModule {}
