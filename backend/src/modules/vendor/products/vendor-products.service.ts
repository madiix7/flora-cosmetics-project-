import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { RedisService } from '../../../common/redis/redis.service'
import { CreateVendorProductDto } from './dto/create-vendor-product.dto'

@Injectable()
export class VendorProductsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(vendorId: string, dto: CreateVendorProductDto) {
    // 1. Verify the perfume exists in master catalog
    const perfume = await this.prisma.perfume.findUnique({
      where: { id: dto.perfumeId },
      include: { brand: true },
    })
    if (!perfume) throw new NotFoundException('Perfume not found in master catalog')

    // 2. Prevent duplicate — one vendor per perfume
    const existing = await this.prisma.vendorProduct.findUnique({
      where: { vendorId_perfumeId: { vendorId, perfumeId: dto.perfumeId } },
    })
    if (existing) throw new ConflictException('You already carry this perfume')

    // 3. Create product + inventory in a transaction
    const product = await this.prisma.$transaction(async (tx) => {
      const vp = await tx.vendorProduct.create({
        data: {
          vendorId,
          perfumeId: dto.perfumeId,
          status: 'ACTIVE',
          inventory: {
            createMany: {
              data: dto.inventory.map((item) => ({
                sizeMl: item.sizeMl,
                sku: item.sku,
                price: item.price,
                currency: item.currency ?? 'DZD',
                stockQuantity: item.stockQuantity ?? 0,
              })),
            },
          },
        },
        include: { perfume: { include: { brand: true } }, inventory: true },
      })
      return vp
    })

    // 4. Invalidate vendor's product cache
    await this.redis.del(`vendor:products:${vendorId}`)
    return product
  }

  async findAll(vendorId: string) {
    const cacheKey = `vendor:products:${vendorId}`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const products = await this.prisma.vendorProduct.findMany({
      where: { vendorId },
      include: {
        perfume: {
          include: {
            brand: true,
            notes: { include: { note: true } },
            accords: { include: { accord: true } },
            families: { include: { family: true } },
          },
        },
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    await this.redis.setex(cacheKey, 120, JSON.stringify(products))
    return products
  }

  async findOne(vendorId: string, productId: string) {
    const product = await this.prisma.vendorProduct.findFirst({
      where: { id: productId, vendorId },
      include: {
        perfume: { include: { brand: true } },
        inventory: true,
      },
    })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  async deactivate(vendorId: string, productId: string) {
    await this.findOne(vendorId, productId)
    await this.prisma.vendorProduct.update({
      where: { id: productId },
      data: { status: 'INACTIVE' },
    })
    await this.redis.del(`vendor:products:${vendorId}`)
    return { success: true }
  }
}
