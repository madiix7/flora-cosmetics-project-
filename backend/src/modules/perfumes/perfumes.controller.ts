import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { SearchService } from '../search/search.service'
import { PerfumesService } from './perfumes.service'
import { SearchPerfumeDto } from './dto/search-perfume.dto'

@Controller('perfumes')
@UseGuards(JwtAuthGuard)
export class PerfumesController {
  constructor(
    private search: SearchService,
    private perfumes: PerfumesService,
  ) {}

  @Get('search')
  async search(@Query() dto: SearchPerfumeDto) {
    return this.search.search(dto.q, dto.limit, dto.offset)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfumes.findById(id)
  }
}
