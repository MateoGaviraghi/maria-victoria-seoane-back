import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // GENERAR SLUG
  // ==========================================
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim();
  }

  // ==========================================
  // CREAR CATEGORÍA
  // ==========================================
  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug || this.generateSlug(dto.name);

    // Verificar si ya existe el slug
    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese slug');
    }

    // Verificar si ya existe el nombre
    const existingName = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        order: dto.order ?? 0,
      },
    });
  }

  // ==========================================
  // OBTENER TODAS LAS CATEGORÍAS
  // ==========================================
  async findAll(options?: {
    includeCoursesCount?: boolean;
    onlyWithCourses?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    const categories = await this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        courses: options?.includeCoursesCount
          ? {
              select: { courseId: true },
            }
          : false,
      },
    });

    let result = categories.map((cat) => ({
      ...cat,
      coursesCount: cat.courses?.length || 0,
      courses: undefined, // No incluir el array completo
    }));

    if (options?.onlyWithCourses) {
      result = result.filter((cat) => cat.coursesCount > 0);
    }

    return {
      data: result,
      total: result.length,
    };
  }

  // ==========================================
  // OBTENER CATEGORÍA POR ID
  // ==========================================
  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  // ==========================================
  // OBTENER CATEGORÍA POR SLUG
  // ==========================================
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  // ==========================================
  // ACTUALIZAR CATEGORÍA
  // ==========================================
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    // Si se actualiza el nombre, verificar que no exista
    if (dto.name && dto.name !== category.name) {
      const existingName = await this.prisma.category.findUnique({
        where: { name: dto.name },
      });
      if (existingName) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    // Si se actualiza el slug, verificar que no exista
    let slug = dto.slug;
    if (dto.name && !dto.slug) {
      slug = this.generateSlug(dto.name);
    }

    if (slug && slug !== category.slug) {
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug },
      });
      if (existingSlug) {
        throw new ConflictException('Ya existe una categoría con ese slug');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        order: dto.order,
      },
    });
  }

  // ==========================================
  // ELIMINAR CATEGORÍA
  // ==========================================
  async delete(id: string): Promise<{ message: string }> {
    await this.findById(id);

    // Verificar si tiene cursos asociados
    const coursesCount = await this.prisma.courseCategory.count({
      where: { categoryId: id },
    });

    if (coursesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría porque tiene ${coursesCount} curso(s) asociado(s)`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Categoría eliminada correctamente' };
  }

  // ==========================================
  // REORDENAR CATEGORÍAS
  // ==========================================
  async reorder(
    orderedIds: string[],
  ): Promise<{ message: string; count: number }> {
    const updates = orderedIds.map((id, index) =>
      this.prisma.category.update({
        where: { id },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return {
      message: 'Categorías reordenadas correctamente',
      count: orderedIds.length,
    };
  }
}
