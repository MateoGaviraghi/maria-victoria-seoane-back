import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Module as CourseModule } from '@prisma/client';
import {
  CreateModuleDto,
  UpdateModuleDto,
  ModuleWithLessonsResponseDto,
} from './dto/course-modules.dto';

@Injectable()
export class CourseModulesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREAR MÓDULO
  // ==========================================
  async create(dto: CreateModuleDto): Promise<CourseModule> {
    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Si no se proporciona orden, ponerlo al final
    let order = dto.order;
    if (order === undefined) {
      const lastModule = await this.prisma.module.findFirst({
        where: { courseId: dto.courseId },
        orderBy: { order: 'desc' },
      });
      order = lastModule ? lastModule.order + 1 : 0;
    }

    return this.prisma.module.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        order,
      },
    });
  }

  // ==========================================
  // OBTENER MÓDULOS DE UN CURSO
  // ==========================================
  async findByCourseId(
    courseId: string,
    includeLessons = false,
  ): Promise<{ data: any[]; total: number }> {
    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const modules = await this.prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: includeLessons
          ? {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                isFree: true,
                order: true,
              },
            }
          : {
              select: { id: true, duration: true },
            },
      },
    });

    const data = modules.map((module) => ({
      ...module,
      lessonsCount: module.lessons.length,
      totalDuration: module.lessons.reduce(
        (acc, l) => acc + (l.duration || 0),
        0,
      ),
      lessons: includeLessons ? module.lessons : undefined,
    }));

    return {
      data,
      total: modules.length,
    };
  }

  // ==========================================
  // OBTENER MÓDULO POR ID
  // ==========================================
  async findById(
    id: string,
    includeLessons = false,
  ): Promise<ModuleWithLessonsResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        lessons: includeLessons
          ? {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                isFree: true,
                order: true,
              },
            }
          : {
              select: { id: true, duration: true },
            },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    return {
      ...module,
      lessonsCount: module.lessons.length,
      totalDuration: module.lessons.reduce(
        (acc, l) => acc + (l.duration || 0),
        0,
      ),
      lessons: includeLessons
        ? (module.lessons as ModuleWithLessonsResponseDto['lessons'])
        : undefined,
    };
  }

  // ==========================================
  // ACTUALIZAR MÓDULO
  // ==========================================
  async update(id: string, dto: UpdateModuleDto): Promise<CourseModule> {
    const module = await this.prisma.module.findUnique({ where: { id } });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    // No permitir cambiar de curso
    if (dto.courseId && dto.courseId !== module.courseId) {
      throw new BadRequestException('No se puede cambiar el curso del módulo');
    }

    return this.prisma.module.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        order: dto.order,
      },
    });
  }

  // ==========================================
  // ELIMINAR MÓDULO
  // ==========================================
  async delete(
    id: string,
  ): Promise<{ message: string; deletedLessons: number }> {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { lessons: { select: { id: true } } },
    });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    const lessonsCount = module.lessons.length;

    // Eliminar módulo (las lecciones se eliminan en cascada)
    await this.prisma.module.delete({
      where: { id },
    });

    // Reordenar módulos restantes
    const remainingModules = await this.prisma.module.findMany({
      where: { courseId: module.courseId },
      orderBy: { order: 'asc' },
    });

    const updates = remainingModules.map((m, index) =>
      this.prisma.module.update({
        where: { id: m.id },
        data: { order: index },
      }),
    );

    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }

    return {
      message: 'Módulo eliminado correctamente',
      deletedLessons: lessonsCount,
    };
  }

  // ==========================================
  // REORDENAR MÓDULOS
  // ==========================================
  async reorder(
    courseId: string,
    orderedIds: string[],
  ): Promise<{ message: string; count: number }> {
    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar que todos los módulos pertenecen al curso
    const modules = await this.prisma.module.findMany({
      where: { courseId },
      select: { id: true },
    });

    const moduleIds = modules.map((m) => m.id);
    const invalidIds = orderedIds.filter((id) => !moduleIds.includes(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Los siguientes módulos no pertenecen al curso: ${invalidIds.join(', ')}`,
      );
    }

    const updates = orderedIds.map((id, index) =>
      this.prisma.module.update({
        where: { id },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return {
      message: 'Módulos reordenados correctamente',
      count: orderedIds.length,
    };
  }

  // ==========================================
  // DUPLICAR MÓDULO
  // ==========================================
  async duplicate(id: string): Promise<ModuleWithLessonsResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        lessons: true,
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    // Obtener el último orden
    const lastModule = await this.prisma.module.findFirst({
      where: { courseId: module.courseId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastModule ? lastModule.order + 1 : 0;

    // Crear el nuevo módulo
    const newModule = await this.prisma.module.create({
      data: {
        courseId: module.courseId,
        title: `${module.title} (copia)`,
        description: module.description,
        order: newOrder,
      },
    });

    // Duplicar las lecciones
    if (module.lessons.length > 0) {
      await this.prisma.lesson.createMany({
        data: module.lessons.map((lesson) => ({
          moduleId: newModule.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          content: lesson.content,
          resources: lesson.resources ?? undefined,
          order: lesson.order,
          isFree: lesson.isFree,
        })),
      });
    }

    return this.findById(newModule.id, true);
  }
}
