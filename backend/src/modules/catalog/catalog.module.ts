import { Module } from '@nestjs/common'
import { BrandsService } from './brands/brands.service'
import { BrandsController } from './brands/brands.controller'
import { NotesService } from './notes/notes.service'
import { AccordsService } from './accords/accords.service'
import { FamiliesService } from './families/families.service'

@Module({
  providers: [BrandsService, NotesService, AccordsService, FamiliesService],
  controllers: [BrandsController],
  exports: [BrandsService, NotesService, AccordsService, FamiliesService],
})
export class CatalogModule {}
