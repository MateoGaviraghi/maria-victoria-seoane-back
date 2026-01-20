import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Tipo para cupón con cursos
type CouponWithCourses = Prisma.CouponGetPayload<{
  include: {
    courses: {
      include: {
        course: {
          select: {
            id: true;
            title: true;
          };
        };
      };
    };
  };
}>;
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  CouponResponseDto,
  CouponListResponseDto,
  CouponValidationResponseDto,
  CouponStatsResponseDto,
} from './dto/coupons.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // CREAR CUPÓN
  // ==========================================
  async create(dto: CreateCouponDto): Promise<CouponResponseDto> {
    const { courseIds, ...couponData } = dto;

    // Verificar que el código no exista
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: couponData.code.toUpperCase() },
    });

    if (existingCoupon) {
      throw new ConflictException('Ya existe un cupón con ese código');
    }

    // Validar porcentaje máximo 100
    if (couponData.type === 'PERCENTAGE' && couponData.value > 100) {
      throw new BadRequestException('El porcentaje no puede ser mayor a 100');
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        ...couponData,
        code: couponData.code.toUpperCase(),
        validFrom: couponData.validFrom
          ? new Date(couponData.validFrom)
          : new Date(),
        validUntil: couponData.validUntil
          ? new Date(couponData.validUntil)
          : undefined,
        courses: courseIds
          ? {
              create: courseIds.map((courseId) => ({
                course: { connect: { id: courseId } },
              })),
            }
          : undefined,
      },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    return this.mapCouponToResponse(coupon);
  }

  // ==========================================
  // OBTENER TODOS LOS CUPONES
  // ==========================================
  async findAll(): Promise<CouponListResponseDto> {
    const coupons = await this.prisma.coupon.findMany({
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      coupons: coupons.map((c) => this.mapCouponToResponse(c)),
      total: coupons.length,
    };
  }

  // ==========================================
  // OBTENER CUPÓN POR ID
  // ==========================================
  async findById(id: string): Promise<CouponResponseDto> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    return this.mapCouponToResponse(coupon);
  }

  // ==========================================
  // ACTUALIZAR CUPÓN
  // ==========================================
  async update(id: string, dto: UpdateCouponDto): Promise<CouponResponseDto> {
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    const { courseIds, ...updateData } = dto;

    // Verificar código único si se cambia
    if (updateData.code && updateData.code !== existingCoupon.code) {
      const codeExists = await this.prisma.coupon.findUnique({
        where: { code: updateData.code.toUpperCase() },
      });
      if (codeExists) {
        throw new ConflictException('Ya existe un cupón con ese código');
      }
    }

    // Validar porcentaje máximo 100
    if (
      updateData.type === 'PERCENTAGE' &&
      updateData.value &&
      updateData.value > 100
    ) {
      throw new BadRequestException('El porcentaje no puede ser mayor a 100');
    }

    // Actualizar relaciones de cursos si se proporcionan
    if (courseIds !== undefined) {
      // Eliminar relaciones existentes
      await this.prisma.courseCoupon.deleteMany({
        where: { couponId: id },
      });

      // Crear nuevas relaciones
      if (courseIds.length > 0) {
        await this.prisma.courseCoupon.createMany({
          data: courseIds.map((courseId) => ({
            couponId: id,
            courseId,
          })),
        });
      }
    }

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...updateData,
        code: updateData.code?.toUpperCase(),
        validFrom: updateData.validFrom
          ? new Date(updateData.validFrom)
          : undefined,
        validUntil: updateData.validUntil
          ? new Date(updateData.validUntil)
          : undefined,
      },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    return this.mapCouponToResponse(coupon);
  }

  // ==========================================
  // ELIMINAR CUPÓN
  // ==========================================
  async delete(id: string): Promise<void> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    await this.prisma.coupon.delete({
      where: { id },
    });
  }

  // ==========================================
  // VALIDAR CUPÓN (Público)
  // ==========================================
  async validateCoupon(
    dto: ValidateCouponDto,
    userId?: string,
  ): Promise<CouponValidationResponseDto> {
    const { code, courseIds, subtotal } = dto;

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        courses: {
          select: { courseId: true },
        },
      },
    });

    if (!coupon) {
      return {
        valid: false,
        code,
        type: 'PERCENTAGE',
        value: 0,
        message: 'Cupón no válido',
      };
    }

    // Verificar si está activo
    if (!coupon.isActive) {
      return {
        valid: false,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Este cupón no está activo',
      };
    }

    // Verificar fecha de validez
    const now = new Date();
    if (coupon.validFrom > now) {
      return {
        valid: false,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Este cupón aún no es válido',
      };
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return {
        valid: false,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Este cupón ha expirado',
      };
    }

    // Verificar límite de usos totales
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return {
        valid: false,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Este cupón ha alcanzado el límite de usos',
      };
    }

    // Verificar límite de usos por usuario
    if (userId) {
      const userUsage = await this.prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });

      if (userUsage >= coupon.maxUsesPerUser) {
        return {
          valid: false,
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          message: 'Ya has usado este cupón',
        };
      }
    }

    // Verificar compra mínima
    if (
      coupon.minPurchase &&
      subtotal &&
      subtotal < Number(coupon.minPurchase)
    ) {
      return {
        valid: false,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        message: `Compra mínima requerida: $${String(coupon.minPurchase)}`,
      };
    }

    // Verificar si aplica a cursos específicos
    if (coupon.courses.length > 0 && courseIds && courseIds.length > 0) {
      const couponCourseIds = coupon.courses.map((c) => c.courseId);
      const hasValidCourse = courseIds.some((id) =>
        couponCourseIds.includes(id),
      );

      if (!hasValidCourse) {
        return {
          valid: false,
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          message: 'Este cupón no aplica a los cursos en tu carrito',
        };
      }
    }

    // Calcular descuento si se proporciona subtotal
    let discountAmount: number | undefined;
    if (subtotal) {
      if (coupon.type === 'PERCENTAGE') {
        discountAmount = (subtotal * Number(coupon.value)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
          discountAmount = Number(coupon.maxDiscount);
        }
      } else {
        discountAmount = Number(coupon.value);
      }
      discountAmount = Math.min(discountAmount, subtotal);
    }

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      discountAmount,
    };
  }

  // ==========================================
  // ESTADÍSTICAS DE CUPONES
  // ==========================================
  async getStats(): Promise<CouponStatsResponseDto> {
    const [totalCoupons, activeCoupons, usageStats] = await Promise.all([
      this.prisma.coupon.count(),
      this.prisma.coupon.count({ where: { isActive: true } }),
      this.prisma.coupon.aggregate({
        _sum: { currentUses: true },
      }),
    ]);

    // Calcular descuento total desde órdenes
    const ordersWithCoupons = await this.prisma.order.aggregate({
      where: {
        couponId: { not: null },
        status: 'COMPLETED',
      },
      _sum: { discountAmount: true },
    });

    return {
      totalCoupons,
      activeCoupons,
      totalUses: usageStats._sum.currentUses || 0,
      totalDiscount: Number(ordersWithCoupons._sum.discountAmount || 0),
    };
  }

  // ==========================================
  // REGISTRAR USO DE CUPÓN
  // ==========================================
  async recordUsage(couponId: string, userId: string): Promise<void> {
    // Incrementar contador
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: { currentUses: { increment: 1 } },
    });

    // Registrar uso del usuario
    await this.prisma.couponUsage.create({
      data: {
        couponId,
        userId,
      },
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private mapCouponToResponse(coupon: CouponWithCourses): CouponResponseDto {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : undefined,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      maxUses: coupon.maxUses ?? undefined,
      maxUsesPerUser: coupon.maxUsesPerUser,
      currentUses: coupon.currentUses,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil ?? undefined,
      isActive: coupon.isActive,
      description: coupon.description ?? undefined,
      courses: coupon.courses?.map((c) => ({
        id: c.course.id,
        title: c.course.title,
      })),
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }
}
