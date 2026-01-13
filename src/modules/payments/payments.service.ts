import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { EmailsService } from '../emails/emails.service';
import {
  PaymentFilterDto,
  MercadoPagoWebhookDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  PaymentStatsResponseDto,
} from './dto/payments.dto';
import {
  PaymentStatus,
  OrderStatus,
  StudentStatus,
  Payment,
} from '@prisma/client';

// Interface para respuesta de MercadoPago
interface MercadoPagoPayment {
  id: string;
  status: string;
  external_reference: string;
  payment_method_id: string;
  payment_type_id: string;
  installments: number;
}

// Tipo para where clause de Payment
interface PaymentWhereInput {
  status?: PaymentStatus;
  userId?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly emailsService: EmailsService,
  ) {}

  // ==========================================
  // PROCESAR WEBHOOK DE MERCADOPAGO
  // ==========================================
  async processWebhook(webhook: MercadoPagoWebhookDto): Promise<void> {
    this.logger.log(`Webhook recibido: ${webhook.type} - ${webhook.action}`);

    // Solo procesar notificaciones de pago
    if (webhook.type !== 'payment') {
      this.logger.log(`Tipo de webhook ignorado: ${webhook.type}`);
      return;
    }

    const paymentId = webhook.data.id;

    // Obtener detalles del pago desde MercadoPago
    const paymentDetails = await this.getPaymentFromMercadoPago(paymentId);

    if (!paymentDetails) {
      this.logger.error(
        `No se pudo obtener el pago ${paymentId} de MercadoPago`,
      );
      return;
    }

    // Buscar la orden por external_reference
    const orderId = paymentDetails.external_reference;

    const payment = await this.prisma.payment.findFirst({
      where: {
        order: { id: orderId },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      this.logger.error(`Pago no encontrado para orden ${orderId}`);
      return;
    }

    // Mapear estado de MercadoPago
    const status = this.mapMercadoPagoStatus(paymentDetails.status);

    // Actualizar pago
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        mercadoPagoId: paymentId,
        status,
        paymentMethod: paymentDetails.payment_method_id,
        paymentType: paymentDetails.payment_type_id,
        installments: paymentDetails.installments,
        paidAt: status === PaymentStatus.APPROVED ? new Date() : undefined,
        rawWebhook: paymentDetails as object,
      },
    });

    // Si está aprobado, completar la orden
    if (status === PaymentStatus.APPROVED) {
      await this.completeOrderAfterPayment(payment.orderId);
    }

    this.logger.log(`Pago ${paymentId} procesado. Estado: ${status}`);
  }

  // ==========================================
  // OBTENER PAGO DESDE MERCADOPAGO
  // ==========================================
  private async getPaymentFromMercadoPago(
    paymentId: string,
  ): Promise<MercadoPagoPayment | null> {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );

    if (!accessToken || accessToken.startsWith('tu_')) {
      this.logger.warn('MercadoPago no configurado');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as MercadoPagoPayment;
    } catch (error) {
      this.logger.error(`Error obteniendo pago de MercadoPago: ${error}`);
      return null;
    }
  }

  // ==========================================
  // COMPLETAR ORDEN DESPUÉS DEL PAGO
  // ==========================================
  private async completeOrderAfterPayment(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });

    if (!order) {
      return;
    }

    // Transacción para actualizar todo
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
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { currentUses: { increment: 1 } },
        });

        // Verificar si ya existe el registro de uso
        const existingUsage = await tx.couponUsage.findUnique({
          where: {
            couponId_userId: {
              couponId: order.couponId,
              userId: order.userId,
            },
          },
        });

        if (!existingUsage) {
          await tx.couponUsage.create({
            data: {
              couponId: order.couponId,
              userId: order.userId,
            },
          });
        }
      }
    });

    this.logger.log(`Orden ${orderId} completada exitosamente`);

    // Enviar email de confirmación de compra
    try {
      const courses = order.items.map((item) => ({
        title: item.title,
        price: parseFloat(item.price.toString()),
      }));

      await this.emailsService.sendPurchaseConfirmedEmail(
        order.user.email,
        order.user.firstName,
        order.id,
        courses,
        parseFloat(order.subtotal.toString()),
        parseFloat(order.discountAmount.toString()),
        parseFloat(order.total.toString()),
        order.userId,
      );

      // Enviar email con acceso al curso
      const courseAccess = order.items.map((item) => ({
        title: item.title,
        accessUrl: `${this.configService.get('FRONTEND_URL')}/my-courses/${item.courseId}`,
        // TODO: Generar credenciales reales si se usa plataforma externa
        username: order.user.email,
        password: 'Ver en plataforma',
      }));

      await this.emailsService.sendCourseAccessEmail(
        order.user.email,
        order.user.firstName,
        courseAccess,
        order.userId,
      );
    } catch (error) {
      this.logger.error('Error sending confirmation emails:', error);
    }
  }

  // ==========================================
  // MAPEAR ESTADO DE MERCADOPAGO
  // ==========================================
  private mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      approved: PaymentStatus.APPROVED,
      authorized: PaymentStatus.APPROVED,
      pending: PaymentStatus.PENDING,
      in_process: PaymentStatus.PENDING,
      in_mediation: PaymentStatus.PENDING,
      rejected: PaymentStatus.REJECTED,
      cancelled: PaymentStatus.REJECTED,
      refunded: PaymentStatus.REFUNDED,
      charged_back: PaymentStatus.REFUNDED,
    };

    return statusMap[mpStatus] || PaymentStatus.PENDING;
  }

  // ==========================================
  // SIMULAR PAGO (para testing sin MercadoPago)
  // ==========================================
  async simulatePaymentApproval(orderId: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Actualizar pago como aprobado
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.APPROVED,
        mercadoPagoId: `sim_${Date.now()}`,
        paymentMethod: 'credit_card',
        paymentType: 'visa',
        paidAt: new Date(),
      },
    });

    // Completar orden
    await this.completeOrderAfterPayment(orderId);

    return this.mapPaymentToResponse(updatedPayment);
  }

  // ==========================================
  // OBTENER TODOS LOS PAGOS (Admin)
  // ==========================================
  async findAll(dto: PaymentFilterDto): Promise<PaymentListResponseDto> {
    const { status, userId, dateFrom, dateTo, page = 1, limit = 10 } = dto;

    const where: PaymentWhereInput = {};

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

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map((p) => this.mapPaymentToResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // OBTENER PAGO POR ID
  // ==========================================
  async findById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return this.mapPaymentToResponse(payment);
  }

  // ==========================================
  // ESTADÍSTICAS DE PAGOS
  // ==========================================
  async getStats(): Promise<PaymentStatsResponseDto> {
    const [
      totalPayments,
      approvedPayments,
      pendingPayments,
      rejectedPayments,
      amountStats,
    ] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.APPROVED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.REJECTED } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.APPROVED },
        _sum: { amount: true },
        _avg: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      approvedPayments,
      pendingPayments,
      rejectedPayments,
      totalAmount: Number(amountStats._sum.amount || 0),
      averageAmount: Number(amountStats._avg.amount || 0),
    };
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private mapPaymentToResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      mercadoPagoId: payment.mercadoPagoId ?? undefined,
      paymentMethod: payment.paymentMethod ?? undefined,
      paymentType: payment.paymentType ?? undefined,
      installments: payment.installments ?? undefined,
      paidAt: payment.paidAt ?? undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
