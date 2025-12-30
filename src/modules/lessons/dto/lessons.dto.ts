import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  IsObject,
  Min,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

// ==========================================
// CREATE LESSON DTO
// ==========================================
export class CreateLessonDto {
  @ApiProperty({
    example: 'uuid-del-modulo',
    description: 'ID del módulo al que pertenece la lección',
  })
  @IsUUID()
  moduleId: string;

  @ApiProperty({
    example: 'Instalación de NestJS',
    description: 'Título de la lección',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'En esta lección aprenderás a instalar NestJS...',
    description: 'Descripción de la lección',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://vimeo.com/123456789',
    description: 'URL del video de la lección',
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: 15,
    description: 'Duración del video en minutos',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({
    example: '# Contenido de la lección\n\nEste es el contenido en markdown...',
    description: 'Contenido adicional de la lección (markdown)',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: [
      { name: 'Código fuente', url: 'https://github.com/...' },
      { name: 'PDF', url: 'https://...' },
    ],
    description: 'Recursos descargables de la lección',
  })
  @IsOptional()
  @IsObject()
  resources?: Prisma.InputJsonValue;

  @ApiPropertyOptional({
    example: 0,
    description: 'Orden de la lección dentro del módulo',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Si la lección es gratuita (preview)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFree?: boolean;
}

// ==========================================
// UPDATE LESSON DTO
// ==========================================
export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @IsOptional()
  @IsUUID()
  moduleId?: string;
}

// ==========================================
// LESSON RESPONSE DTO
// ==========================================
export class LessonResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-del-modulo' })
  moduleId: string;

  @ApiProperty({ example: 'Instalación de NestJS' })
  title: string;

  @ApiPropertyOptional({ example: 'En esta lección aprenderás...' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://vimeo.com/123456789' })
  videoUrl?: string | null;

  @ApiPropertyOptional({ example: 15 })
  duration?: number | null;

  @ApiPropertyOptional({ example: '# Contenido...' })
  content?: string | null;

  @ApiPropertyOptional({ type: Object })
  resources?: any;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ example: false })
  isFree: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ==========================================
// LESSON DETAIL RESPONSE DTO
// ==========================================
export class LessonDetailResponseDto extends LessonResponseDto {
  @ApiPropertyOptional({ type: Object })
  module?: {
    id: string;
    title: string;
    courseId: string;
    course?: {
      id: string;
      title: string;
      slug: string;
    };
  };

  @ApiPropertyOptional({ type: Object })
  navigation?: {
    previous?: { id: string; title: string } | null;
    next?: { id: string; title: string } | null;
  };
}

// ==========================================
// LESSON LIST RESPONSE DTO
// ==========================================
export class LessonListResponseDto {
  @ApiProperty({ type: [LessonResponseDto] })
  data: LessonResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}

// ==========================================
// REORDER LESSONS DTO
// ==========================================
export class ReorderLessonsDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description: 'IDs de las lecciones en el nuevo orden',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  orderedIds: string[];
}

// ==========================================
// MOVE LESSON DTO
// ==========================================
export class MoveLessonDto {
  @ApiProperty({
    example: 'uuid-nuevo-modulo',
    description: 'ID del módulo destino',
  })
  @IsUUID()
  targetModuleId: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Posición en el módulo destino',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;
}
