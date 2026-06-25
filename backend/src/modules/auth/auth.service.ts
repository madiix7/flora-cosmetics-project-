import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../common/prisma/prisma.service'
import { JwtPayload } from '../../common/decorators/current-vendor.decorator'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async loginVendor(email: string, password: string): Promise<{ accessToken: string }> {
    // NOTE: In production, hash comparison via bcrypt. Simplified here.
    const vendor = await this.prisma.vendor.findUnique({ where: { email } })
    if (!vendor || !vendor.isActive) throw new UnauthorizedException('Invalid credentials')

    const payload: JwtPayload = { sub: vendor.id, email: vendor.email, type: 'vendor' }
    return { accessToken: this.jwt.sign(payload) }
  }
}
