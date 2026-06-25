import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client: Redis

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(this.config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    })
    this.client.on('error', (err) => this.logger.error('Redis error', err))
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value)
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.client.setex(key, ttlSeconds, value)
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.client.del(...keys)
  }

  /** Delete all keys matching a glob pattern — use sparingly, O(N) */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern)
    if (keys.length > 0) await this.client.del(...keys)
  }

  async ping(): Promise<string> {
    return this.client.ping()
  }
}
