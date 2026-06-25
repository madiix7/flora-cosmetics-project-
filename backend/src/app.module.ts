import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { BullModule } from '@nestjs/bullmq'
import * as Joi from 'joi'

import { PrismaModule } from './common/prisma/prisma.module'
import { RedisModule } from './common/redis/redis.module'
import { MeilisearchModule } from './common/meilisearch/meilisearch.module'

import { AuthModule } from './modules/auth/auth.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { PerfumesModule } from './modules/perfumes/perfumes.module'
import { SearchModule } from './modules/search/search.module'
import { EnrichmentModule } from './modules/enrichment/enrichment.module'
import { VendorModule } from './modules/vendor/vendor.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    // Config — validate env vars at startup
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        MEILISEARCH_HOST: Joi.string().required(),
        MEILISEARCH_API_KEY: Joi.string().default(''),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
      }),
    }),

    // Rate limiting backed by Redis
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [{ ttl: 60000, limit: 60 }],  // 60 req/min default
      }),
    }),

    // BullMQ — shared Redis connection
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: { url: cfg.get<string>('REDIS_URL') },
      }),
    }),

    // Global singletons
    PrismaModule,
    RedisModule,
    MeilisearchModule,

    // Feature modules
    AuthModule,
    CatalogModule,
    SearchModule,
    PerfumesModule,
    VendorModule,
    EnrichmentModule,
    HealthModule,
  ],
})
export class AppModule {}
