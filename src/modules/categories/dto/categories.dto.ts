import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

// ==========================================
// CREATE CATEGORY DTO
// ==========================================
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Desarrollo Web',
    description: 'Nombre de la categoría',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'desarrollo-web',
    description:
      'Slug único para URLs (se genera automáticamente si no se proporciona)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  slug?: string;

  @ApiPropertyOptional({
    example: 'Cursos de desarrollo web frontend y backend',
    description: 'Descripción de la categoría',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen de la categoría',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Orden de visualización',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;
}

// ==========================================
// UPDATE CATEGORY DTO
// ==========================================
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

// ==========================================
// CATEGORY RESPONSE DTO
// ==========================================
export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'Desarrollo Web' })
  name: string;

  @ApiProperty({ example: 'desarrollo-web' })
  slug: string;

  @ApiPropertyOptional({ example: 'Cursos de desarrollo web' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  imageUrl?: string | null;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ example: 5 })
  coursesCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ==========================================
// CATEGORY LIST RESPONSE DTO
// ==========================================
export class CategoryListResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
