import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseModulesService } from './course-modules.service';
import {
  CreateModuleDto,
  UpdateModuleDto,
  ModuleResponseDto,
  ModuleWithLessonsResponseDto,
  ModuleListResponseDto,
  ReorderModulesDto,
} from './dto/course-modules.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Course Modules')
@Controller('modules')
export class CourseModulesController {
  constructor(private readonly modulesService: CourseModulesService) {}

  // ==========================================
  // CREAR MÓDULO (Admin)
  // ==========================================
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo módulo' })
  @ApiResponse({
    status: 201,
    description: 'Módulo creado exitosamente',
    type: ModuleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async create(@Body() dto: CreateModuleDto): Promise<ModuleResponseDto> {
    return this.modulesService.create(dto);
  }

  // ==========================================
  // OBTENER MÓDULOS DE UN CURSO
  // ==========================================
  @Get('course/:courseId')
  @Public()
  @ApiOperation({ summary: 'Obtener módulos de un curso' })
  @ApiQuery({
    name: 'includeLessons',
    required: false,
    type: Boolean,
    description: 'Incluir lecciones de cada módulo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de módulos',
    type: ModuleListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async findByCourseId(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('includeLessons') includeLessons?: string,
  ): Promise<ModuleListResponseDto> {
    return this.modulesService.findByCourseId(
      courseId,
      includeLessons === 'true',
    );
  }

  // ==========================================
  // OBTENER MÓDULO POR ID
  // ==========================================
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener módulo por ID' })
  @ApiQuery({
    name: 'includeLessons',
    required: false,
    type: Boolean,
    description: 'Incluir lecciones del módulo',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo encontrado',
    type: ModuleWithLessonsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeLessons') includeLessons?: string,
  ): Promise<ModuleWithLessonsResponseDto> {
    return this.modulesService.findById(id, includeLessons === 'true');
  }

  // ==========================================
  // ACTUALIZAR MÓDULO (Admin)
  // ==========================================
  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar módulo' })
  @ApiResponse({
    status: 200,
    description: 'Módulo actualizado',
    type: ModuleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return this.modulesService.update(id, dto);
  }

  // ==========================================
  // ELIMINAR MÓDULO (Admin)
  // ==========================================
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar módulo y sus lecciones' })
  @ApiResponse({ status: 204, description: 'Módulo eliminado' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.modulesService.delete(id);
  }

  // ==========================================
  // REORDENAR MÓDULOS (Admin)
  // ==========================================
  @Put('course/:courseId/reorder')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar módulos de un curso' })
  @ApiResponse({ status: 200, description: 'Módulos reordenados' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async reorder(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: ReorderModulesDto,
  ): Promise<{ message: string; count: number }> {
    return this.modulesService.reorder(courseId, dto.orderedIds);
  }

  // ==========================================
  // DUPLICAR MÓDULO (Admin)
  // ==========================================
  @Post(':id/duplicate')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicar módulo con sus lecciones' })
  @ApiResponse({
    status: 201,
    description: 'Módulo duplicado',
    type: ModuleWithLessonsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ModuleWithLessonsResponseDto> {
    return this.modulesService.duplicate(id);
  }
}
