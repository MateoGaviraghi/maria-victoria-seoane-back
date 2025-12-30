import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Lesson } from '@prisma/client';
import {
  CreateLessonDto,
  UpdateLessonDto,
  MoveLessonDto,
  LessonDetailResponseDto,
} from './dto/lessons.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREAR LECCIÓN
  // ==========================================
  async create(dto: CreateLessonDto): Promise<Lesson> {
    // Verificar que el módulo existe
    const module = await this.prisma.module.findUnique({
      where: { id: dto.moduleId },
    });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    // Si no se proporciona orden, ponerla al final
    let order = dto.order;
    if (order === undefined) {
      const lastLesson = await this.prisma.lesson.findFirst({
        where: { moduleId: dto.moduleId },
        orderBy: { order: 'desc' },
      });
      order = lastLesson ? lastLesson.order + 1 : 0;
    }

    return this.prisma.lesson.create({
      data: {
        moduleId: dto.moduleId,
        title: dto.title,
        description: dto.description,
        videoUrl: dto.videoUrl,
        duration: dto.duration,
        content: dto.content,
        resources: dto.resources ?? undefined,
        order,
        isFree: dto.isFree || false,
      },
    });
  }

  // ==========================================
  // OBTENER LECCIONES DE UN MÓDULO
  // ==========================================
  async findByModuleId(
    moduleId: string,
  ): Promise<{ data: Lesson[]; total: number }> {
    // Verificar que el módulo existe
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });

    return {
      data: lessons,
      total: lessons.length,
    };
  }

  // ==========================================
  // OBTENER LECCIÓN POR ID
  // ==========================================
  async findById(
    id: string,
    includeNavigation = false,
  ): Promise<LessonDetailResponseDto> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    // Obtener navegación (anterior y siguiente)
    let navigation:
      | {
          previous: { id: string; title: string } | null;
          next: { id: string; title: string } | null;
        }
      | undefined = undefined;
    if (includeNavigation) {
      const [previous, next] = await Promise.all([
        this.prisma.lesson.findFirst({
          where: {
            moduleId: lesson.moduleId,
            order: { lt: lesson.order },
          },
          orderBy: { order: 'desc' },
          select: { id: true, title: true },
        }),
        this.prisma.lesson.findFirst({
          where: {
            moduleId: lesson.moduleId,
            order: { gt: lesson.order },
          },
          orderBy: { order: 'asc' },
          select: { id: true, title: true },
        }),
      ]);

      navigation = { previous, next };
    }

    return {
      ...lesson,
      navigation,
    };
  }

  // ==========================================
  // ACTUALIZAR LECCIÓN
  // ==========================================
  async update(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    // No permitir cambiar de módulo directamente (usar move)
    if (dto.moduleId && dto.moduleId !== lesson.moduleId) {
      throw new BadRequestException(
        'No se puede cambiar el módulo directamente. Use el endpoint de mover lección.',
      );
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        videoUrl: dto.videoUrl,
        duration: dto.duration,
        content: dto.content,
        resources: dto.resources ?? undefined,
        order: dto.order,
        isFree: dto.isFree,
      },
    });
  }

  // ==========================================
  // ELIMINAR LECCIÓN
  // ==========================================
  async delete(id: string): Promise<void> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    // Verificar si tiene progreso de estudiantes
    const progressCount = await this.prisma.lessonProgress.count({
      where: { lessonId: id },
    });

    if (progressCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la lección porque tiene ${progressCount} registro(s) de progreso de estudiantes`,
      );
    }

    await this.prisma.lesson.delete({
      where: { id },
    });

    // Reordenar lecciones restantes
    const remainingLessons = await this.prisma.lesson.findMany({
      where: { moduleId: lesson.moduleId },
      orderBy: { order: 'asc' },
    });

    const updates = remainingLessons.map((l, index) =>
      this.prisma.lesson.update({
        where: { id: l.id },
        data: { order: index },
      }),
    );

    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }
  }

  // ==========================================
  // REORDENAR LECCIONES
  // ==========================================
  async reorder(
    moduleId: string,
    orderedIds: string[],
  ): Promise<{ message: string; count: number }> {
    // Verificar que el módulo existe
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    // Verificar que todas las lecciones pertenecen al módulo
    const lessons = await this.prisma.lesson.findMany({
      where: { moduleId },
      select: { id: true },
    });

    const lessonIds = lessons.map((l) => l.id);
    const invalidIds = orderedIds.filter((id) => !lessonIds.includes(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Las siguientes lecciones no pertenecen al módulo: ${invalidIds.join(', ')}`,
      );
    }

    const updates = orderedIds.map((id, index) =>
      this.prisma.lesson.update({
        where: { id },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return {
      message: 'Lecciones reordenadas correctamente',
      count: orderedIds.length,
    };
  }

  // ==========================================
  // MOVER LECCIÓN A OTRO MÓDULO
  // ==========================================
  async move(id: string, dto: MoveLessonDto): Promise<LessonDetailResponseDto> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    // Verificar que el módulo destino existe
    const targetModule = await this.prisma.module.findUnique({
      where: { id: dto.targetModuleId },
    });

    if (!targetModule) {
      throw new NotFoundException('Módulo destino no encontrado');
    }

    // Verificar que el módulo destino es del mismo curso
    const sourceModule = await this.prisma.module.findUnique({
      where: { id: lesson.moduleId },
    });

    if (sourceModule?.courseId !== targetModule.courseId) {
      throw new BadRequestException(
        'No se puede mover la lección a un módulo de otro curso',
      );
    }

    // Obtener el orden en el módulo destino
    let order = dto.order;
    if (order === undefined) {
      const lastLesson = await this.prisma.lesson.findFirst({
        where: { moduleId: dto.targetModuleId },
        orderBy: { order: 'desc' },
      });
      order = lastLesson ? lastLesson.order + 1 : 0;
    }

    // Mover la lección
    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        moduleId: dto.targetModuleId,
        order,
      },
    });

    // Reordenar lecciones del módulo origen
    const sourceLessons = await this.prisma.lesson.findMany({
      where: { moduleId: lesson.moduleId },
      orderBy: { order: 'asc' },
    });

    const sourceUpdates = sourceLessons.map((l, index) =>
      this.prisma.lesson.update({
        where: { id: l.id },
        data: { order: index },
      }),
    );

    if (sourceUpdates.length > 0) {
      await this.prisma.$transaction(sourceUpdates);
    }

    return this.findById(updatedLesson.id);
  }

  // ==========================================
  // DUPLICAR LECCIÓN
  // ==========================================
  async duplicate(id: string): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    // Obtener el último orden
    const lastLesson = await this.prisma.lesson.findFirst({
      where: { moduleId: lesson.moduleId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastLesson ? lastLesson.order + 1 : 0;

    return this.prisma.lesson.create({
      data: {
        moduleId: lesson.moduleId,
        title: `${lesson.title} (copia)`,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        content: lesson.content,
        resources: lesson.resources ?? undefined,
        order: newOrder,
        isFree: lesson.isFree,
      },
    });
  }

  // ==========================================
  // OBTENER LECCIONES GRATUITAS DE UN CURSO
  // ==========================================
  async findFreeByCourseId(courseId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        isFree: true,
        module: { courseId },
      },
      orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
      include: {
        module: {
          select: { id: true, title: true },
        },
      },
    });

    return lessons;
  }
}
