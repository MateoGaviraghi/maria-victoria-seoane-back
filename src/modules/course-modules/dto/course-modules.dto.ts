import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ==========================================
// CREATE MODULE DTO
// ==========================================
export class CreateModuleDto {
  @ApiProperty({
    example: 'uuid-del-curso',
    description: 'ID del curso al que pertenece el módulo',
  })
  @IsUUID()
  courseId: string;

  @ApiProperty({
    example: 'Introducción a NestJS',
    description: 'Título del módulo',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'En este módulo aprenderás los conceptos básicos',
    description: 'Descripción del módulo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Orden del módulo dentro del curso',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;
}

// ==========================================
// UPDATE MODULE DTO
// ==========================================
export class UpdateModuleDto extends PartialType(CreateModuleDto) {
  @IsOptional()
  @IsUUID()
  courseId?: string; // No se puede cambiar el curso
}

// ==========================================
// MODULE RESPONSE DTO
// ==========================================
export class ModuleResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-del-curso' })
  courseId: string;

  @ApiProperty({ example: 'Introducción a NestJS' })
  title: string;

  @ApiPropertyOptional({ example: 'En este módulo aprenderás...' })
  description?: string | null;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiPropertyOptional({ example: 5 })
  lessonsCount?: number;

  @ApiPropertyOptional({ example: 60 })
  totalDuration?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ==========================================
// MODULE WITH LESSONS RESPONSE DTO
// ==========================================
export class ModuleWithLessonsResponseDto extends ModuleResponseDto {
  @ApiPropertyOptional({ type: [Object] })
  lessons?: {
    id: string;
    title: string;
    description?: string | null;
    duration?: number | null;
    isFree: boolean;
    order: number;
  }[];
}

// ==========================================
// MODULE LIST RESPONSE DTO
// ==========================================
export class ModuleListResponseDto {
  @ApiProperty({ type: [ModuleWithLessonsResponseDto] })
  data: ModuleWithLessonsResponseDto[];

  @ApiProperty({ example: 5 })
  total: number;
}

// ==========================================
// REORDER MODULES DTO
// ==========================================
export class ReorderModulesDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description: 'IDs de los módulos en el nuevo orden',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  orderedIds: string[];
}
