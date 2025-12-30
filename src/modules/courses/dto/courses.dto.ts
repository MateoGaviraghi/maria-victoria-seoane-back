import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
  IsArray,
  IsUUID,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

// ==========================================
// CREATE COURSE DTO
// ==========================================
export class CreateCourseDto {
  @ApiProperty({
    example: 'Curso Completo de NestJS',
    description: 'Título del curso',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'curso-completo-nestjs',
    description: 'Slug único para URLs (se genera automáticamente)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  slug?: string;

  @ApiProperty({
    example: 'Aprende NestJS desde cero hasta nivel avanzado',
    description: 'Descripción corta del curso',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  shortDescription: string;

  @ApiProperty({
    example: 'En este curso aprenderás todo sobre NestJS...',
    description: 'Descripción larga del curso',
  })
  @IsString()
  @MinLength(50)
  longDescription: string;

  @ApiProperty({
    example: 29990,
    description: 'Precio del curso en centavos o unidad mínima',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 19990,
    description: 'Precio con descuento',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  discountPrice?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/thumbnail.jpg',
    description: 'URL de la imagen del curso',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: 'https://youtube.com/watch?v=xxx',
    description: 'URL del video de preview',
  })
  @IsOptional()
  @IsString()
  previewVideoUrl?: string;

  @ApiPropertyOptional({
    example: 120,
    description: 'Duración total en minutos',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({
    example: 'Principiante',
    description: 'Nivel del curso',
    enum: ['Principiante', 'Intermedio', 'Avanzado'],
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: 'Español',
    description: 'Idioma del curso',
    default: 'Español',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Si el curso está publicado',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublished?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Si el curso está destacado',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Orden de visualización',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({
    example: ['uuid-1', 'uuid-2'],
    description: 'IDs de las categorías del curso',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}

// ==========================================
// UPDATE COURSE DTO
// ==========================================
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

// ==========================================
// COURSE QUERY DTO
// ==========================================
export class CourseQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Página', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Elementos por página',
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 'nestjs', description: 'Buscar por título' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'uuid-categoria',
    description: 'Filtrar por categoría',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'desarrollo-web',
    description: 'Filtrar por slug de categoría',
  })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({
    example: 'Principiante',
    description: 'Filtrar por nivel',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Solo cursos publicados',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Solo cursos destacados',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: 'price',
    description: 'Ordenar por campo',
    enum: ['title', 'price', 'createdAt', 'order'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

// ==========================================
// COURSE RESPONSE DTO
// ==========================================
export class CourseResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'Curso Completo de NestJS' })
  title: string;

  @ApiProperty({ example: 'curso-completo-nestjs' })
  slug: string;

  @ApiProperty({ example: 'Aprende NestJS desde cero' })
  shortDescription: string;

  @ApiProperty({ example: 'En este curso aprenderás...' })
  longDescription: string;

  @ApiProperty({ example: 29990 })
  price: number;

  @ApiPropertyOptional({ example: 19990 })
  discountPrice?: number | null;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg' })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=xxx' })
  previewVideoUrl?: string | null;

  @ApiPropertyOptional({ example: 120 })
  duration?: number | null;

  @ApiPropertyOptional({ example: 'Principiante' })
  level?: string | null;

  @ApiProperty({ example: 'Español' })
  language: string;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiPropertyOptional({ type: [Object] })
  categories?: { id: string; name: string; slug: string }[];

  @ApiPropertyOptional({ example: 5 })
  modulesCount?: number;

  @ApiPropertyOptional({ example: 25 })
  lessonsCount?: number;

  @ApiPropertyOptional({ example: 4.5 })
  averageRating?: number;

  @ApiPropertyOptional({ example: 150 })
  studentsCount?: number;

  @ApiPropertyOptional({ example: 10 })
  reviewsCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ==========================================
// COURSE LIST RESPONSE DTO
// ==========================================
export class CourseListResponseDto {
  @ApiProperty({ type: [CourseResponseDto] })
  data: CourseResponseDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

// ==========================================
// COURSE DETAIL RESPONSE DTO
// ==========================================
export class CourseDetailResponseDto extends CourseResponseDto {
  @ApiPropertyOptional({ type: [Object] })
  modules?: {
    id: string;
    title: string;
    description?: string | null;
    order: number;
    lessonsCount: number;
    lessons?: {
      id: string;
      title: string;
      duration?: number | null;
      isFree: boolean;
      order: number;
    }[];
  }[];
}
