import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseDetailResponseDto,
} from './dto/courses.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // GENERAR SLUG
  // ==========================================
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // ==========================================
  // GENERAR SLUG ÚNICO
  // ==========================================
  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const slug = this.generateSlug(title);
    let counter = 0;
    let uniqueSlug = slug;

    while (true) {
      const existing = await this.prisma.course.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing || existing.id === excludeId) {
        break;
      }

      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    return uniqueSlug;
  }

  // ==========================================
  // CREAR CURSO
  // ==========================================
  async create(dto: CreateCourseDto): Promise<CourseDetailResponseDto> {
    const slug = dto.slug || (await this.generateUniqueSlug(dto.title));

    // Verificar si ya existe el slug
    if (dto.slug) {
      const existing = await this.prisma.course.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new ConflictException('Ya existe un curso con ese slug');
      }
    }

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        slug,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        price: dto.price,
        discountPrice: dto.discountPrice,
        thumbnailUrl: dto.thumbnailUrl,
        previewVideoUrl: dto.previewVideoUrl,
        duration: dto.duration,
        level: dto.level,
        language: dto.language || 'Español',
        isPublished: dto.isPublished || false,
        isFeatured: dto.isFeatured || false,
        order: dto.order || 0,
      },
    });

    // Asociar categorías si se proporcionaron
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this.prisma.courseCategory.createMany({
        data: dto.categoryIds.map((categoryId) => ({
          courseId: course.id,
          categoryId,
        })),
      });
    }

    return this.findById(course.id);
  }

  // ==========================================
  // OBTENER TODOS LOS CURSOS
  // ==========================================
  async findAll(query: CourseQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      categorySlug,
      level,
      isPublished,
      isFeatured,
      sortBy = 'order',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir where
    const where: Prisma.CourseWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }

    if (categorySlug) {
      where.categories = {
        some: {
          category: { slug: categorySlug },
        },
      };
    }

    if (level) {
      where.level = level;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Construir orderBy
    const orderBy: Prisma.CourseOrderByWithRelationInput = {};
    if (sortBy === 'title') orderBy.title = sortOrder;
    else if (sortBy === 'price') orderBy.price = sortOrder;
    else if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;
    else orderBy.order = sortOrder;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: {
            include: {
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          modules: {
            select: { id: true },
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    // Formatear respuesta
    const data = courses.map((course) => ({
      ...course,
      price: Number(course.price),
      discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
      categories: course.categories.map((cc) => cc.category),
      modulesCount: course.modules.length,
      studentsCount: course._count.orderItems,
      reviewsCount: course._count.reviews,
      modules: undefined,
      _count: undefined,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // OBTENER CURSO POR ID
  // ==========================================
  async findById(
    id: string,
    includeModules = false,
  ): Promise<CourseDetailResponseDto> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                isFree: true,
                order: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Calcular promedio de ratings
    const avgRating = await this.prisma.review.aggregate({
      where: { courseId: id },
      _avg: { rating: true },
    });

    // Contar lecciones totales
    const lessonsCount = await this.prisma.lesson.count({
      where: { module: { courseId: id } },
    });

    // Excluir _count del spread
    const { _count, categories, modules, ...courseData } = course;

    return {
      ...courseData,
      price: Number(course.price),
      discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
      categories: categories.map((cc) => cc.category),
      modulesCount: modules.length,
      lessonsCount,
      studentsCount: _count.orderItems,
      reviewsCount: _count.reviews,
      averageRating: avgRating._avg.rating || 0,
      modules: includeModules
        ? modules.map((m) => ({
            ...m,
            lessonsCount: m.lessons?.length || 0,
          }))
        : undefined,
    };
  }

  // ==========================================
  // OBTENER CURSO POR SLUG
  // ==========================================
  async findBySlug(slug: string): Promise<CourseDetailResponseDto> {
    const course = await this.prisma.course.findUnique({
      where: { slug },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return this.findById(course.id, true);
  }

  // ==========================================
  // ACTUALIZAR CURSO
  // ==========================================
  async update(
    id: string,
    dto: UpdateCourseDto,
  ): Promise<CourseDetailResponseDto> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Generar nuevo slug si se actualiza el título
    let slug = dto.slug;
    if (dto.title && !dto.slug) {
      slug = await this.generateUniqueSlug(dto.title, id);
    } else if (dto.slug && dto.slug !== course.slug) {
      const existing = await this.prisma.course.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe un curso con ese slug');
      }
    }

    // Actualizar categorías si se proporcionaron
    if (dto.categoryIds !== undefined) {
      // Eliminar categorías existentes
      await this.prisma.courseCategory.deleteMany({
        where: { courseId: id },
      });

      // Crear nuevas asociaciones
      if (dto.categoryIds.length > 0) {
        await this.prisma.courseCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            courseId: id,
            categoryId,
          })),
        });
      }
    }

    await this.prisma.course.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        price: dto.price,
        discountPrice: dto.discountPrice,
        thumbnailUrl: dto.thumbnailUrl,
        previewVideoUrl: dto.previewVideoUrl,
        duration: dto.duration,
        level: dto.level,
        language: dto.language,
        isPublished: dto.isPublished,
        isFeatured: dto.isFeatured,
        order: dto.order,
      },
    });

    return this.findById(id);
  }

  // ==========================================
  // ELIMINAR CURSO
  // ==========================================
  async delete(id: string): Promise<{ message: string }> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar si tiene órdenes
    const ordersCount = await this.prisma.orderItem.count({
      where: { courseId: id },
    });

    if (ordersCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el curso porque tiene ${ordersCount} orden(es) asociada(s)`,
      );
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return { message: 'Curso eliminado correctamente' };
  }

  // ==========================================
  // PUBLICAR/DESPUBLICAR CURSO
  // ==========================================
  async togglePublish(id: string): Promise<CourseDetailResponseDto> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    await this.prisma.course.update({
      where: { id },
      data: { isPublished: !course.isPublished },
    });

    return this.findById(id);
  }

  // ==========================================
  // DESTACAR/QUITAR DESTACADO
  // ==========================================
  async toggleFeatured(id: string): Promise<CourseDetailResponseDto> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    await this.prisma.course.update({
      where: { id },
      data: { isFeatured: !course.isFeatured },
    });

    return this.findById(id);
  }

  // ==========================================
  // REORDENAR CURSOS
  // ==========================================
  async reorder(
    orderedIds: string[],
  ): Promise<{ message: string; count: number }> {
    const updates = orderedIds.map((id, index) =>
      this.prisma.course.update({
        where: { id },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return {
      message: 'Cursos reordenados correctamente',
      count: orderedIds.length,
    };
  }

  // ==========================================
  // CURSOS DESTACADOS (PÚBLICO)
  // ==========================================
  async findFeatured(limit = 6): Promise<CourseDetailResponseDto[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      take: limit,
      orderBy: { order: 'asc' },
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return courses.map((course) => ({
      ...course,
      price: Number(course.price),
      discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
      categories: course.categories.map((cc) => cc.category),
    }));
  }

  // ==========================================
  // ESTADÍSTICAS DEL CURSO (ADMIN)
  // ==========================================
  async getStats(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const [studentsCount, reviewsCount, avgRating, totalRevenue] =
      await Promise.all([
        // Contar estudiantes que compraron el curso (órdenes completadas)
        this.prisma.orderItem.count({
          where: {
            courseId: id,
            order: { status: 'COMPLETED' },
          },
        }),
        this.prisma.review.count({ where: { courseId: id } }),
        this.prisma.review.aggregate({
          where: { courseId: id },
          _avg: { rating: true },
        }),
        this.prisma.orderItem.aggregate({
          where: {
            courseId: id,
            order: { status: 'COMPLETED' },
          },
          _sum: { price: true },
        }),
      ]);

    return {
      courseId: id,
      title: course.title,
      students: {
        total: studentsCount,
      },
      reviews: {
        total: reviewsCount,
        averageRating: avgRating._avg.rating || 0,
      },
      revenue: {
        total: Number(totalRevenue._sum.price) || 0,
      },
    };
  }
}
