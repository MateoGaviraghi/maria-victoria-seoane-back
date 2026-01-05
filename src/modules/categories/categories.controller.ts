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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryListResponseDto,
} from './dto/categories.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ==========================================
  // CREAR CATEGORÍA (Admin)
  // ==========================================
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva categoría' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 409, description: 'La categoría ya existe' })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto);
  }

  // ==========================================
  // OBTENER TODAS LAS CATEGORÍAS (Público)
  // ==========================================
  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiQuery({
    name: 'includeCoursesCount',
    required: false,
    type: Boolean,
    description: 'Incluir cantidad de cursos por categoría',
  })
  @ApiQuery({
    name: 'onlyWithCourses',
    required: false,
    type: Boolean,
    description: 'Solo mostrar categorías con cursos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías',
    type: CategoryListResponseDto,
  })
  async findAll(
    @Query('includeCoursesCount') includeCoursesCount?: string,
    @Query('onlyWithCourses') onlyWithCourses?: string,
  ): Promise<CategoryListResponseDto> {
    return this.categoriesService.findAll({
      includeCoursesCount: includeCoursesCount === 'true',
      onlyWithCourses: onlyWithCourses === 'true',
    });
  }

  // ==========================================
  // OBTENER CATEGORÍA POR ID
  // ==========================================
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findById(id);
  }

  // ==========================================
  // OBTENER CATEGORÍA POR SLUG
  // ==========================================
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Obtener categoría por slug' })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findBySlug(slug);
  }

  // ==========================================
  // ACTUALIZAR CATEGORÍA (Admin)
  // ==========================================
  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con nombre/slug existente',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto);
  }

  // ==========================================
  // ELIMINAR CATEGORÍA (Admin)
  // ==========================================
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar categoría' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, tiene cursos asociados',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.categoriesService.delete(id);
  }

  // ==========================================
  // REORDENAR CATEGORÍAS (Admin)
  // ==========================================
  @Put('reorder/batch')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar categorías' })
  @ApiResponse({ status: 200, description: 'Categorías reordenadas' })
  async reorder(
    @Body() body: { orderedIds: string[] },
  ): Promise<{ message: string; count: number }> {
    return this.categoriesService.reorder(body.orderedIds);
  }
}
