import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  MoveLessonDto,
  LessonResponseDto,
  LessonDetailResponseDto,
  LessonListResponseDto,
  ReorderLessonsDto,
} from './dto/lessons.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // ==========================================
  // CREAR LECCIÓN (Admin)
  // ==========================================
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva lección' })
  @ApiResponse({
    status: 201,
    description: 'Lección creada exitosamente',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  async create(@Body() dto: CreateLessonDto): Promise<LessonResponseDto> {
    return this.lessonsService.create(dto);
  }

  // ==========================================
  // OBTENER LECCIONES DE UN MÓDULO
  // ==========================================
  @Get('module/:moduleId')
  @Public()
  @ApiOperation({ summary: 'Obtener lecciones de un módulo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecciones',
    type: LessonListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  async findByModuleId(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
  ): Promise<LessonListResponseDto> {
    return this.lessonsService.findByModuleId(moduleId);
  }

  // ==========================================
  // OBTENER LECCIÓN POR ID
  // ==========================================
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener lección por ID' })
  @ApiResponse({
    status: 200,
    description: 'Lección encontrada',
    type: LessonDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lección no encontrada' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LessonDetailResponseDto> {
    return this.lessonsService.findById(id);
  }

  // ==========================================
  // ACTUALIZAR LECCIÓN (Admin)
  // ==========================================
  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar lección' })
  @ApiResponse({
    status: 200,
    description: 'Lección actualizada',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lección no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    return this.lessonsService.update(id, dto);
  }

  // ==========================================
  // ELIMINAR LECCIÓN (Admin)
  // ==========================================
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar lección' })
  @ApiResponse({ status: 200, description: 'Lección eliminada' })
  @ApiResponse({ status: 404, description: 'Lección no encontrada' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.lessonsService.delete(id);
  }

  // ==========================================
  // REORDENAR LECCIONES (Admin)
  // ==========================================
  @Put('module/:moduleId/reorder')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar lecciones de un módulo' })
  @ApiResponse({ status: 200, description: 'Lecciones reordenadas' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  async reorder(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() dto: ReorderLessonsDto,
  ): Promise<{ message: string; count: number }> {
    return this.lessonsService.reorder(moduleId, dto.orderedIds);
  }

  // ==========================================
  // MOVER LECCIÓN A OTRO MÓDULO (Admin)
  // ==========================================
  @Patch(':id/move')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mover lección a otro módulo' })
  @ApiResponse({
    status: 200,
    description: 'Lección movida',
    type: LessonDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lección o módulo no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede mover a un módulo de otro curso',
  })
  async move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveLessonDto,
  ): Promise<LessonDetailResponseDto> {
    return this.lessonsService.move(id, dto);
  }

  // ==========================================
  // DUPLICAR LECCIÓN (Admin)
  // ==========================================
  @Post(':id/duplicate')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicar lección' })
  @ApiResponse({
    status: 201,
    description: 'Lección duplicada',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lección no encontrada' })
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LessonResponseDto> {
    return this.lessonsService.duplicate(id);
  }
}
