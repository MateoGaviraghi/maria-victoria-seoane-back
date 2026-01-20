import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OrderFilterDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsResponseDto,
} from './dto/orders.dto';
import {
  Role,
  OrderStatus,
  StudentStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

// Tipo para where clause de Order
interface OrderWhereInput {
  userId?: string;
  status?: OrderStatus;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

// Interface para orden con relaciones (flexible)
interface OrderWithRelations {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  total: Prisma.Decimal;
  currency: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerDni: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    courseId: string;
    title: string;
    price: Prisma.Decimal;
    course?: {
      id: string;
      title: string;
      slug?: string;
    };
  }>;
  payments?: Array<{
    id: string;
    status: PaymentStatus;
    amount: Prisma.Decimal;
    paymentMethod: string | null;
    paymentType: string | null;
    installments: number | null;
    paidAt: Date | null;
  }>;
  coupon?: {
    code: string;
  } | null;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // MIS ÓRDENES (Usuario autenticado)
  // ==========================================
  async getMyOrders(
    userId: string,
    dto: OrderFilterDto,
  ): Promise<OrderListResponseDto> {
    const { status, dateFrom, dateTo, page = 1, limit = 10 } = dto;

    const where: OrderWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              course: {
                select: { id: true, title: true, slug: true },
              },
            },
          },
          payments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => this.mapOrderToResponse(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // OBTENER ORDEN POR ID
  // ==========================================
  async findById(
    orderId: string,
    userId: string,
    userRole: Role,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
        payments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        coupon: {
          select: { code: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Verificar acceso
    if (
      userRole !== Role.SUPER_ADMIN &&
      userRole !== Role.OWNER &&
      order.userId !== userId
    ) {
      throw new ForbiddenException('No tienes acceso a esta orden');
    }

    return this.mapOrderToResponse(order);
  }

  // ==========================================
  // ADMIN: OBTENER TODAS LAS ÓRDENES
  // ==========================================
  async findAll(dto: OrderFilterDto): Promise<OrderListResponseDto> {
    const { status, userId, dateFrom, dateTo, page = 1, limit = 10 } = dto;

    const where: OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              course: {
                select: { id: true, title: true },
              },
            },
          },
          payments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => this.mapOrderToResponse(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // ESTADÍSTICAS DE ÓRDENES
  // ==========================================
  async getStats(): Promise<OrderStatsResponseDto> {
    const [totalOrders, completedOrders, pendingOrders, revenueData] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
        this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        this.prisma.order.aggregate({
          where: { status: OrderStatus.COMPLETED },
          _sum: { total: true },
          _avg: { total: true },
        }),
      ]);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue: Number(revenueData._sum.total || 0),
      averageOrderValue: Number(revenueData._avg.total || 0),
    };
  }

  // ==========================================
  // CANCELAR ORDEN (Solo si está PENDING)
  // ==========================================
  async cancelOrder(
    orderId: string,
    userId: string,
    userRole: Role,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Verificar acceso
    if (
      userRole !== Role.SUPER_ADMIN &&
      userRole !== Role.OWNER &&
      order.userId !== userId
    ) {
      throw new ForbiddenException('No tienes acceso a esta orden');
    }

    // Solo se puede cancelar si está pendiente
    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException(
        'Solo se pueden cancelar órdenes pendientes',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
        payments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return this.mapOrderToResponse(updatedOrder);
  }

  // ==========================================
  // MARCAR ORDEN COMO COMPLETADA (Interno, para webhooks)
  // ==========================================
  async completeOrder(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    await this.prisma.$transaction(async (tx) => {
      // Actualizar orden
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED },
      });

      // Actualizar estado del usuario
      await tx.user.update({
        where: { id: order.userId },
        data: { studentStatus: StudentStatus.PAID },
      });

      // Vaciar carrito
      await tx.cartItem.deleteMany({
        where: { userId: order.userId },
      });

      // Registrar uso de cupón si aplica
      if (order.couponId) {
        // Incrementar contador de uso
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { currentUses: { increment: 1 } },
        });

        // Registrar uso del usuario
        await tx.couponUsage.create({
          data: {
            couponId: order.couponId,
            userId: order.userId,
          },
        });
      }
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private mapOrderToResponse(order: OrderWithRelations): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      user: order.user
        ? {
            id: order.user.id,
            firstName: order.user.firstName ?? undefined,
            lastName: order.user.lastName ?? undefined,
            email: order.user.email,
          }
        : undefined,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      currency: order.currency,
      couponCode: order.coupon?.code ?? undefined,
      customerEmail: order.customerEmail ?? undefined,
      customerPhone: order.customerPhone ?? undefined,
      customerDni: order.customerDni ?? undefined,
      items: order.items.map((item) => ({
        id: item.id,
        courseId: item.courseId,
        title: item.title,
        price: Number(item.price),
      })),
      payment: order.payments?.[0]
        ? {
            id: order.payments[0].id,
            status: order.payments[0].status,
            amount: Number(order.payments[0].amount),
            paymentMethod: order.payments[0].paymentMethod ?? undefined,
            paymentType: order.payments[0].paymentType ?? undefined,
            installments: order.payments[0].installments ?? undefined,
            paidAt: order.payments[0].paidAt ?? undefined,
          }
        : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
