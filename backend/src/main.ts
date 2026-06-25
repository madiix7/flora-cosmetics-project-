import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { AuditInterceptor } from './common/interceptors/audit.interceptor'
import { PrismaService } from './common/prisma/prisma.service'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )

  // Global validation — whitelist strips unknown fields, forbidNonWhitelisted rejects requests with extra keys
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  )

  // Global exception filter — structured error responses, 5xx logging
  const prisma = app.get(PrismaService)
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalInterceptors(new AuditInterceptor(prisma))

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? 'https://your-storefront.com' : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })

  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3001)

  await app.listen(port, '0.0.0.0')
  console.log(`Fragrance catalog API running on port ${port}`)
}

bootstrap()
