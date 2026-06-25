import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { IsString, MaxLength, MinLength } from 'class-validator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentVendor, JwtPayload } from '../../common/decorators/current-vendor.decorator'
import { EnrichmentService } from './enrichment.service'
import { Throttle } from '@nestjs/throttler'

class CreateEnrichmentJobDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  query!: string
}

@Controller('enrichment/jobs')
@UseGuards(JwtAuthGuard)
export class EnrichmentController {
  constructor(private enrichment: EnrichmentService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 10, ttl: 3600000 } })  // 10 per hour per vendor
  async create(
    @CurrentVendor() vendor: JwtPayload,
    @Body() dto: CreateEnrichmentJobDto,
  ) {
    return this.enrichment.createJob(dto.query, vendor.sub)
  }

  @Get(':id')
  getOne(@CurrentVendor() vendor: JwtPayload, @Param('id') id: string) {
    return this.enrichment.getJob(id, vendor.sub)
  }
}
