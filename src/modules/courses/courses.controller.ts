import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseResponseDto,
  CourseListResponseDto,
  CourseDetailResponseDto,
} from './dto/courses.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==========================================
  // CREAR CURSO (Admin)
  // ==========================================
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo curso' })
  @ApiResponse({
    status: 201,
    description: 'Curso creado exitosamente',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 409, description: 'El curso ya existe' })
  async create(@Body() dto: CreateCourseDto): Promise<CourseResponseDto> {
    return this.coursesService.create(dto);
  }

  // ==========================================
  // OBTENER TODOS LOS CURSOS (Público con filtros)
  // ==========================================
  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todos los cursos con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos',
    type: CourseListResponseDto,
  })
  async findAll(
    @Query() query: CourseQueryDto,
  ): Promise<CourseListResponseDto> {
    return this.coursesService.findAll(query);
  }

  // ==========================================
  // CURSOS DESTACADOS (Público)
  // ==========================================
  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Obtener cursos destacados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Cursos destacados',
    type: [CourseResponseDto],
  })
  async findFeatured(
    @Query('limit') limit?: string,
  ): Promise<CourseResponseDto[]> {
    return this.coursesService.findFeatured(
      limit ? parseInt(limit) : 6,
    ) as Promise<CourseResponseDto[]>;
  }

  // ==========================================
  // OBTENER CURSO POR SLUG (Público)
  // ==========================================
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Obtener curso por slug' })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.findBySlug(slug);
  }

  // ==========================================
  // OBTENER CURSO POR ID
  // ==========================================
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener curso por ID' })
  @ApiQuery({
    name: 'includeModules',
    required: false,
    type: Boolean,
    description: 'Incluir módulos y lecciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeModules') includeModules?: string,
  ): Promise<CourseDetailResponseDto> {
    return this.coursesService.findById(id, includeModules === 'true');
  }

  // ==========================================
  // ESTADÍSTICAS DEL CURSO (Admin)
  // ==========================================
  @Get(':id/stats')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas del curso' })
  @ApiResponse({ status: 200, description: 'Estadísticas del curso' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getStats(id);
  }

  // ==========================================
  // ACTUALIZAR CURSO (Admin)
  // ==========================================
  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar curso' })
  @ApiResponse({
    status: 200,
    description: 'Curso actualizado',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, dto) as Promise<CourseResponseDto>;
  }

  // ==========================================
  // PUBLICAR/DESPUBLICAR CURSO (Admin)
  // ==========================================
  @Patch(':id/toggle-publish')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publicar o despublicar curso' })
  @ApiResponse({
    status: 200,
    description: 'Estado de publicación cambiado',
    type: CourseResponseDto,
  })
  async togglePublish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourseResponseDto> {
    return this.coursesService.togglePublish(id) as Promise<CourseResponseDto>;
  }

  // ==========================================
  // DESTACAR/QUITAR DESTACADO (Admin)
  // ==========================================
  @Patch(':id/toggle-featured')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Destacar o quitar destacado del curso' })
  @ApiResponse({
    status: 200,
    description: 'Estado de destacado cambiado',
    type: CourseResponseDto,
  })
  async toggleFeatured(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourseResponseDto> {
    return this.coursesService.toggleFeatured(id) as Promise<CourseResponseDto>;
  }

  // ==========================================
  // ELIMINAR CURSO (Admin)
  // ==========================================
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar curso' })
  @ApiResponse({ status: 200, description: 'Curso eliminado' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, tiene estudiantes u órdenes',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.coursesService.delete(id);
  }

  // ==========================================
  // REORDENAR CURSOS (Admin)
  // ==========================================
  @Put('reorder/batch')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar cursos' })
  @ApiResponse({ status: 200, description: 'Cursos reordenados' })
  async reorder(
    @Body() body: { orderedIds: string[] },
  ): Promise<{ message: string; count: number }> {
    return this.coursesService.reorder(body.orderedIds);
  }
}
