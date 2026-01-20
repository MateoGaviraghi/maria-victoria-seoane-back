import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
    example: 15,
    description: 'Duración estimada en minutos (para mostrar en temario)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  duration?: number;

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

  @ApiPropertyOptional({
    example: 15,
    description: 'Duración estimada en minutos',
  })
  duration?: number | null;

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
