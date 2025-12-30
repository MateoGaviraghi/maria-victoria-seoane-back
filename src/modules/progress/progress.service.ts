import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CourseProgress, LessonProgress } from '@prisma/client';
import {
  StartCourseProgressDto,
  UpdateLessonProgressDto,
  CourseProgressDetailResponseDto,
  UserCoursesProgressResponseDto,
} from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // VERIFICAR ACCESO AL CURSO
  // ==========================================
  private async verifyAccess(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    // TODO: Habilitar cuando se implementen Orders (Fase 4)
    // Por ahora, permitir acceso a todos para testing
    return true;

    // Verificar si el usuario tiene una orden completada con este curso
    // const hasAccess = await this.prisma.orderItem.findFirst({
    //   where: {
    //     courseId,
    //     order: {
    //       userId,
    //       status: 'COMPLETED',
    //     },
    //   },
    // });
    // return !!hasAccess;
  }

  // ==========================================
  // INICIAR PROGRESO DE CURSO
  // ==========================================
  async startCourse(
    userId: string,
    dto: StartCourseProgressDto,
  ): Promise<CourseProgress> {
    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar acceso al curso
    const hasAccess = await this.verifyAccess(userId, dto.courseId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    // Verificar si ya existe progreso
    const existing = await this.prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
    });

    if (existing) {
      // Actualizar última acceso
      return this.prisma.courseProgress.update({
        where: { id: existing.id },
        data: { lastAccessedAt: new Date() },
      });
    }

    // Crear nuevo progreso
    return this.prisma.courseProgress.create({
      data: {
        userId,
        courseId: dto.courseId,
        progressPercent: 0,
      },
    });
  }

  // ==========================================
  // ACTUALIZAR PROGRESO DE LECCIÓN
  // ==========================================
  async updateLessonProgress(
    userId: string,
    dto: UpdateLessonProgressDto,
  ): Promise<LessonProgress> {
    // Verificar que la lección existe
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: {
        module: {
          select: { courseId: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    const courseId = lesson.module.courseId;

    // Verificar acceso al curso
    const hasAccess = await this.verifyAccess(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    // Buscar o crear progreso de lección
    let lessonProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: dto.lessonId,
        },
      },
    });

    if (lessonProgress) {
      // Actualizar progreso existente
      lessonProgress = await this.prisma.lessonProgress.update({
        where: { id: lessonProgress.id },
        data: {
          isCompleted: dto.isCompleted ?? lessonProgress.isCompleted,
          completedAt:
            dto.isCompleted && !lessonProgress.isCompleted
              ? new Date()
              : lessonProgress.completedAt,
          watchTime: dto.watchTime ?? lessonProgress.watchTime,
        },
      });
    } else {
      // Crear nuevo progreso
      lessonProgress = await this.prisma.lessonProgress.create({
        data: {
          userId,
          lessonId: dto.lessonId,
          isCompleted: dto.isCompleted || false,
          completedAt: dto.isCompleted ? new Date() : null,
          watchTime: dto.watchTime || 0,
        },
      });
    }

    // Recalcular progreso del curso
    await this.recalculateCourseProgress(userId, courseId);

    return lessonProgress;
  }

  // ==========================================
  // RECALCULAR PROGRESO DEL CURSO
  // ==========================================
  private async recalculateCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<void> {
    // Contar total de lecciones del curso
    const totalLessons = await this.prisma.lesson.count({
      where: {
        module: { courseId },
      },
    });

    if (totalLessons === 0) return;

    // Contar lecciones completadas
    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          module: { courseId },
        },
      },
    });

    // Calcular porcentaje
    const progressPercent = Math.round((completedLessons / totalLessons) * 100);

    // Actualizar progreso del curso
    await this.prisma.courseProgress.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: {
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
      },
    });
  }

  // ==========================================
  // OBTENER PROGRESO DE UN CURSO
  // ==========================================
  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<CourseProgressDetailResponseDto> {
    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                order: true,
                duration: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Obtener progreso del curso
    const courseProgress = await this.prisma.courseProgress.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    // Obtener progreso de todas las lecciones del usuario
    const lessonProgresses = await this.prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {
          module: { courseId },
        },
      },
    });

    const lessonProgressMap = new Map(
      lessonProgresses.map((lp) => [lp.lessonId, lp]),
    );

    // Contar totales
    const totalLessons = course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0,
    );
    const completedLessons = lessonProgresses.filter(
      (lp) => lp.isCompleted,
    ).length;

    // Construir respuesta con detalle por módulo
    const modules = course.modules.map((module) => {
      const moduleLessons = module.lessons.map((lesson) => {
        const progress = lessonProgressMap.get(lesson.id);
        return {
          ...lesson,
          isCompleted: progress?.isCompleted || false,
          watchTime: progress?.watchTime || 0,
        };
      });

      const moduleCompletedLessons = moduleLessons.filter(
        (l) => l.isCompleted,
      ).length;

      return {
        id: module.id,
        title: module.title,
        order: module.order,
        lessonsCount: module.lessons.length,
        completedLessons: moduleCompletedLessons,
        progressPercent:
          module.lessons.length > 0
            ? Math.round((moduleCompletedLessons / module.lessons.length) * 100)
            : 0,
        lessons: moduleLessons,
      };
    });

    return {
      id: courseProgress?.id || null,
      userId,
      courseId,
      progressPercent: courseProgress?.progressPercent || 0,
      startedAt: courseProgress?.startedAt || null,
      completedAt: courseProgress?.completedAt || null,
      lastAccessedAt: courseProgress?.lastAccessedAt || null,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnailUrl: course.thumbnailUrl,
        totalLessons,
        completedLessons,
      },
      modules,
    };
  }

  // ==========================================
  // OBTENER TODOS LOS CURSOS DEL USUARIO
  // ==========================================
  async getUserCoursesProgress(
    userId: string,
  ): Promise<UserCoursesProgressResponseDto> {
    // Obtener todos los progresos del usuario
    const progresses = await this.prisma.courseProgress.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            modules: {
              select: {
                lessons: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });

    // Separar en progreso y completados
    const inProgress = progresses
      .filter((p) => !p.completedAt)
      .map((p) => ({
        ...p,
        course: {
          ...p.course,
          totalLessons: p.course.modules.reduce(
            (acc, m) => acc + m.lessons.length,
            0,
          ),
          modules: undefined,
        },
      }));

    const completed = progresses
      .filter((p) => p.completedAt)
      .map((p) => ({
        ...p,
        course: {
          ...p.course,
          totalLessons: p.course.modules.reduce(
            (acc, m) => acc + m.lessons.length,
            0,
          ),
          modules: undefined,
        },
      }));

    return {
      inProgress,
      completed,
      totalCourses: progresses.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
    };
  }

  // ==========================================
  // MARCAR LECCIÓN COMO COMPLETADA
  // ==========================================
  async markLessonComplete(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgress> {
    return this.updateLessonProgress(userId, {
      lessonId,
      isCompleted: true,
    });
  }

  // ==========================================
  // MARCAR LECCIÓN COMO NO COMPLETADA
  // ==========================================
  async markLessonIncomplete(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgress> {
    // Verificar que la lección existe
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: { courseId: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }

    const courseId = lesson.module.courseId;

    // Actualizar progreso
    const lessonProgress = await this.prisma.lessonProgress.update({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      data: {
        isCompleted: false,
        completedAt: null,
      },
    });

    // Recalcular progreso del curso
    await this.recalculateCourseProgress(userId, courseId);

    return lessonProgress;
  }

  // ==========================================
  // OBTENER ÚLTIMA LECCIÓN VISTA
  // ==========================================
  async getLastAccessedLesson(
    userId: string,
    courseId: string,
  ): Promise<{ id: string; title: string; moduleId: string } | null> {
    // Buscar la última lección actualizada
    const lastProgress = await this.prisma.lessonProgress.findFirst({
      where: {
        userId,
        lesson: {
          module: { courseId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
    });

    if (!lastProgress) {
      // Si no hay progreso, devolver la primera lección
      const firstLesson = await this.prisma.lesson.findFirst({
        where: {
          module: { courseId },
        },
        orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
        select: {
          id: true,
          title: true,
          moduleId: true,
        },
      });

      return firstLesson;
    }

    return lastProgress.lesson;
  }

  // ==========================================
  // REINICIAR PROGRESO DEL CURSO
  // ==========================================
  async resetCourseProgress(userId: string, courseId: string): Promise<void> {
    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Eliminar progreso de lecciones
    await this.prisma.lessonProgress.deleteMany({
      where: {
        userId,
        lesson: {
          module: { courseId },
        },
      },
    });

    // Eliminar progreso del curso
    await this.prisma.courseProgress.deleteMany({
      where: { userId, courseId },
    });
  }
}
