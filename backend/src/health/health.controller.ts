import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { RedisService } from '../common/redis/redis.service'
import { MeilisearchService } from '../common/meilisearch/meilisearch.service'

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private meilisearch: MeilisearchService,
  ) {}

  @Get()
  async check() {
    const [dbOk, redisOk, meiliOk] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      this.redis.ping().then((r) => r === 'PONG').catch(() => false),
      this.meilisearch.ping(),
    ])

    const allOk = dbOk && redisOk && meiliOk
    return {
      status: allOk ? 'ok' : 'degraded',
      db: dbOk ? 'ok' : 'error',
      redis: redisOk ? 'ok' : 'error',
      meilisearch: meiliOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('live')
  live() {
    return { status: 'ok' }
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok' }
  }
}
