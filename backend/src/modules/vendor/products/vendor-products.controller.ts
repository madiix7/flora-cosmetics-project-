import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentVendor, JwtPayload } from '../../../common/decorators/current-vendor.decorator'
import { VendorProductsService } from './vendor-products.service'
import { CreateVendorProductDto } from './dto/create-vendor-product.dto'

@Controller('vendor/products')
@UseGuards(JwtAuthGuard)
export class VendorProductsController {
  constructor(private products: VendorProductsService) {}

  @Post()
  create(@CurrentVendor() vendor: JwtPayload, @Body() dto: CreateVendorProductDto) {
    return this.products.create(vendor.sub, dto)
  }

  @Get()
  findAll(@CurrentVendor() vendor: JwtPayload) {
    return this.products.findAll(vendor.sub)
  }

  @Get(':id')
  findOne(@CurrentVendor() vendor: JwtPayload, @Param('id') id: string) {
    return this.products.findOne(vendor.sub, id)
  }

  @Delete(':id')
  deactivate(@CurrentVendor() vendor: JwtPayload, @Param('id') id: string) {
    return this.products.deactivate(vendor.sub, id)
  }
}
