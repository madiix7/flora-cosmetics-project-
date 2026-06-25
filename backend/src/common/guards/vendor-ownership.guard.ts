import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { JwtPayload } from '../decorators/current-vendor.decorator'

/**
 * Ensures that route params like :vendorId match the authenticated vendor's id.
 * Apply after JwtAuthGuard. Admins bypass this check.
 */
@Injectable()
export class VendorOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<
      FastifyRequest & { user: JwtPayload; params: Record<string, string> }
    >()

    const user = req.user
    if (user.type === 'admin') return true

    const vendorId = req.params?.vendorId
    if (!vendorId) return true  // no vendorId param to check

    if (user.sub !== vendorId) {
      throw new ForbiddenException('You do not have access to this resource')
    }
    return true
  }
}
