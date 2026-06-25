import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator'

export class CreateBrandDto {
  @IsString()
  @MaxLength(200)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string

  @IsOptional()
  @IsInt()
  @Min(1800)
  foundedYear?: number

  @IsOptional()
  @IsUrl()
  websiteUrl?: string

  @IsOptional()
  @IsString({ each: true })
  aliases?: string[]
}
