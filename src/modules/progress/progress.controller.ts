import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import {
  StartCourseProgressDto,
  UpdateLessonProgressDto,
  CourseProgressResponseDto,
  CourseProgressDetailResponseDto,
  LessonProgressResponseDto,
  UserCoursesProgressResponseDto,
} from './dto/progress.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // ==========================================
  // INICIAR PROGRESO DE CURSO
  // ==========================================
  @Post('course/start')
  @ApiOperation({ summary: 'Iniciar progreso de un curso' })
  @ApiResponse({
    status: 201,
    description: 'Progreso iniciado',
    type: CourseProgressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este curso' })
  async startCourse(
    @CurrentUser('id') userId: string,
    @Body() dto: StartCourseProgressDto,
  ): Promise<CourseProgressResponseDto> {
    return this.progressService.startCourse(userId, dto);
  }

  // ==========================================
  // OBTENER PROGRESO DE UN CURSO
  // ==========================================
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Obtener progreso detallado de un curso' })
  @ApiResponse({
    status: 200,
    description: 'Progreso del curso',
    type: CourseProgressDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async getCourseProgress(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<CourseProgressDetailResponseDto> {
    return this.progressService.getCourseProgress(userId, courseId);
  }

  // ==========================================
  // OBTENER TODOS LOS CURSOS DEL USUARIO
  // ==========================================
  @Get('my-courses')
  @ApiOperation({ summary: 'Obtener progreso de todos los cursos del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Progreso de todos los cursos',
    type: UserCoursesProgressResponseDto,
  })
  async getUserCoursesProgress(
    @CurrentUser('id') userId: string,
  ): Promise<UserCoursesProgressResponseDto> {
    return this.progressService.getUserCoursesProgress(userId);
  }

  // ==========================================
  // ACTUALIZAR PROGRESO DE LECCIÓN
  // ==========================================
  @Put('lesson')
  @ApiOperation({ summary: 'Actualizar progreso de una lección' })
  @ApiResponse({
    status: 200,
    description: 'Progreso actualizado',
    type: LessonProgressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lección no encontrada' })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este curso' })
  async updateLessonProgress(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLessonProgressDto,
  ): Promise<LessonProgressResponseDto> {
    return this.progressService.updateLessonProgress(userId, dto);
  }

  // ==========================================
  // MARCAR LECCIÓN COMO COMPLETADA
  // ==========================================
  @Post('lesson/:lessonId/complete')
  @ApiOperation({ summary: 'Marcar lección como completada' })
  @ApiResponse({
    status: 200,
    description: 'Lección marcada como completada',
    type: LessonProgressResponseDto,
  })
  async markLessonComplete(
    @CurrentUser('id') userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ): Promise<LessonProgressResponseDto> {
    return this.progressService.markLessonComplete(userId, lessonId);
  }

  // ==========================================
  // MARCAR LECCIÓN COMO NO COMPLETADA
  // ==========================================
  @Post('lesson/:lessonId/incomplete')
  @ApiOperation({ summary: 'Marcar lección como no completada' })
  @ApiResponse({
    status: 200,
    description: 'Lección marcada como no completada',
    type: LessonProgressResponseDto,
  })
  async markLessonIncomplete(
    @CurrentUser('id') userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ): Promise<LessonProgressResponseDto> {
    return this.progressService.markLessonIncomplete(userId, lessonId);
  }

  // ==========================================
  // OBTENER ÚLTIMA LECCIÓN VISTA
  // ==========================================
  @Get('course/:courseId/last-lesson')
  @ApiOperation({ summary: 'Obtener la última lección accedida' })
  @ApiResponse({
    status: 200,
    description: 'Última lección accedida',
  })
  async getLastAccessedLesson(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<{ id: string; title: string; moduleId: string } | null> {
    return this.progressService.getLastAccessedLesson(userId, courseId);
  }

  // ==========================================
  // REINICIAR PROGRESO DEL CURSO
  // ==========================================
  @Delete('course/:courseId/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reiniciar progreso del curso' })
  @ApiResponse({ status: 204, description: 'Progreso reiniciado' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async resetCourseProgress(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<void> {
    return this.progressService.resetCourseProgress(userId, courseId);
  }
}
