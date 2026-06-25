import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class SearchPerfumeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  q!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0
}
