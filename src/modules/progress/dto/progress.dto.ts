import { IsOptional, IsInt, IsBoolean, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ==========================================
// START COURSE PROGRESS DTO
// ==========================================
export class StartCourseProgressDto {
  @ApiProperty({
    example: 'uuid-del-curso',
    description: 'ID del curso',
  })
  @IsUUID()
  courseId: string;
}

// ==========================================
// UPDATE LESSON PROGRESS DTO
// ==========================================
export class UpdateLessonProgressDto {
  @ApiProperty({
    example: 'uuid-de-la-leccion',
    description: 'ID de la lección',
  })
  @IsUUID()
  lessonId: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si la lección fue completada',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCompleted?: boolean;

  @ApiPropertyOptional({
    example: 300,
    description: 'Tiempo visto en segundos',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  watchTime?: number;
}

// ==========================================
// COURSE PROGRESS RESPONSE DTO
// ==========================================
export class CourseProgressResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string | null;

  @ApiProperty({ example: 'uuid-del-usuario' })
  userId: string;

  @ApiProperty({ example: 'uuid-del-curso' })
  courseId: string;

  @ApiProperty({ example: 45 })
  progressPercent: number;

  @ApiPropertyOptional()
  startedAt?: Date | null;

  @ApiPropertyOptional()
  completedAt?: Date | null;

  @ApiPropertyOptional()
  lastAccessedAt?: Date | null;

  @ApiPropertyOptional({ type: Object })
  course?: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string | null;
    totalLessons: number;
    completedLessons?: number;
  };
}

// ==========================================
// LESSON PROGRESS RESPONSE DTO
// ==========================================
export class LessonProgressResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-del-usuario' })
  userId: string;

  @ApiProperty({ example: 'uuid-de-la-leccion' })
  lessonId: string;

  @ApiProperty({ example: false })
  isCompleted: boolean;

  @ApiPropertyOptional()
  completedAt?: Date | null;

  @ApiProperty({ example: 300 })
  watchTime: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ==========================================
// COURSE PROGRESS DETAIL RESPONSE DTO
// ==========================================
export class CourseProgressDetailResponseDto extends CourseProgressResponseDto {
  @ApiPropertyOptional({ type: [Object] })
  modules?: {
    id: string;
    title: string;
    order: number;
    lessonsCount: number;
    completedLessons: number;
    progressPercent: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      duration?: number | null;
      isCompleted: boolean;
      watchTime: number;
    }[];
  }[];
}

// ==========================================
// USER COURSES PROGRESS RESPONSE DTO
// ==========================================
export class UserCoursesProgressResponseDto {
  @ApiProperty({ type: [CourseProgressResponseDto] })
  inProgress: CourseProgressResponseDto[];

  @ApiProperty({ type: [CourseProgressResponseDto] })
  completed: CourseProgressResponseDto[];

  @ApiProperty({ example: 3 })
  totalCourses: number;

  @ApiProperty({ example: 1 })
  completedCourses: number;

  @ApiProperty({ example: 2 })
  inProgressCourses: number;
}

// ==========================================
// CERTIFICATE DTO
// ==========================================
export class CertificateResponseDto {
  @ApiProperty({ example: 'uuid-del-certificado' })
  id: string;

  @ApiProperty({ example: 'uuid-del-usuario' })
  userId: string;

  @ApiProperty({ example: 'Juan Pérez' })
  userName: string;

  @ApiProperty({ example: 'uuid-del-curso' })
  courseId: string;

  @ApiProperty({ example: 'Curso Completo de NestJS' })
  courseTitle: string;

  @ApiProperty()
  completedAt: Date;

  @ApiPropertyOptional({ example: 'https://...' })
  certificateUrl?: string;
}
