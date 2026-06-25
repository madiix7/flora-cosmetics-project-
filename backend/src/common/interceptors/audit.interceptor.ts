import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { FastifyRequest } from 'fastify'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<FastifyRequest & { user?: { id: string; type: string } }>()
    const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    if (!mutating) return next.handle()

    const action = `${req.method.toLowerCase()}.${req.routeOptions?.url ?? req.url}`

    return next.handle().pipe(
      tap(() => {
        this.prisma.auditLog
          .create({
            data: {
              actorId: req.user?.id ?? null,
              actorType: req.user?.type ?? 'anonymous',
              action,
              ipAddress: req.ip,
              payload: { body: req.body as Record<string, unknown> },
            },
          })
          .catch(() => { /* never crash the request */ })
      }),
    )
  }
}
