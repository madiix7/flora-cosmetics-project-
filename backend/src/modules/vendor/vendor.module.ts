import { Module } from '@nestjs/common'
import { VendorProductsController } from './products/vendor-products.controller'
import { VendorProductsService } from './products/vendor-products.service'

@Module({
  providers: [VendorProductsService],
  controllers: [VendorProductsController],
})
export class VendorModule {}
