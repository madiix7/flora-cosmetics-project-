import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { FastifyRequest } from 'fastify'

export interface JwtPayload {
  sub: string
  email: string
  type: 'vendor' | 'admin'
}

export const CurrentVendor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest & { user: JwtPayload }>()
    return req.user
  },
)
