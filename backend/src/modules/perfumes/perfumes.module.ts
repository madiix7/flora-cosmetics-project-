import { Module } from '@nestjs/common'
import { PerfumesController } from './perfumes.controller'
import { PerfumesService } from './perfumes.service'
import { SearchModule } from '../search/search.module'

@Module({
  imports: [SearchModule],
  providers: [PerfumesService],
  controllers: [PerfumesController],
  exports: [PerfumesService],
})
export class PerfumesModule {}
