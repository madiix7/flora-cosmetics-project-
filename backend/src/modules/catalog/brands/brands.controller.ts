import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { BrandsService } from './brands.service'
import { CreateBrandDto } from './dto/create-brand.dto'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'

@Controller('catalog/brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
  constructor(private brands: BrandsService) {}

  @Post()
  create(@Body() dto: CreateBrandDto) {
    return this.brands.create(dto)
  }

  @Get()
  findAll() {
    return this.brands.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brands.findOne(id)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.brands.delete(id)
  }
}
