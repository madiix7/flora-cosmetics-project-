import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

class InventoryItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  sizeMl?: number

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string

  @IsPositive()
  price!: number

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string = 'DZD'

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number = 0
}

export class CreateVendorProductDto {
  @IsUUID()
  perfumeId!: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  inventory!: InventoryItemDto[]
}
