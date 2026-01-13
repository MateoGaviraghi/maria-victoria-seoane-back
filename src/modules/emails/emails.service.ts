import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailType, EmailStatus } from '@prisma/client';

// Templates
import { verificationTemplate } from './templates/verification.template';
import { welcomeTemplate } from './templates/welcome.template';
import { purchaseConfirmedTemplate } from './templates/purchase-confirmed.template';
import { courseAccessTemplate } from './templates/course-access.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { orderCancelledTemplate } from './templates/order-cancelled.template';
import { cartAbandoned1hTemplate } from './templates/cart-abandoned-1h.template';
import { cartAbandoned24hTemplate } from './templates/cart-abandoned-24h.template';
import { cartAbandoned72hTemplate } from './templates/cart-abandoned-72h.template';
import { newCouponTemplate } from './templates/new-coupon.template';
import { birthdayTemplate } from './templates/birthday.template';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private transporter: nodemailer.Transporter;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<number>('MAIL_PORT');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPassword = this.configService.get<string>('MAIL_PASSWORD');

    if (!mailHost || !mailUser || mailUser.startsWith('tu_')) {
      this.logger.warn(
        '⚠️ SMTP no configurado. Los emails se simularán (no se enviarán realmente).',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465,
      auth: {
        user: mailUser,
        pass: mailPassword,
      },
    });

    this.logger.log('✅ SMTP configurado correctamente');
  }

  // ==========================================
  // MÉTODO PRINCIPAL PARA ENVIAR EMAILS
  // ==========================================
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    type: EmailType,
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const mailFrom =
      this.configService.get<string>('MAIL_FROM') || 'noreply@tudominio.com';

    try {
      // Reemplazar variables globales en el HTML
      html = html
        .replace(/\{\{frontendUrl\}\}/g, this.frontendUrl)
        .replace(/\{\{userId\}\}/g, userId || '');

      // Si no hay transporter configurado, simular envío
      if (!this.transporter) {
        this.logger.log(
          `📧 [SIMULADO] Email a ${to} - Tipo: ${type} - Asunto: ${subject}`,
        );

        await this.prisma.emailLog.create({
          data: {
            userId,
            to,
            type,
            subject,
            status: EmailStatus.SENT,
            sentAt: new Date(),
            metadata: metadata || {},
          },
        });

        return;
      }

      // Enviar email real
      await this.transporter.sendMail({
        from: mailFrom,
        to,
        subject,
        html,
      });

      this.logger.log(`✅ Email enviado a ${to} - Tipo: ${type}`);

      // Registrar en DB
      await this.prisma.emailLog.create({
        data: {
          userId,
          to,
          type,
          subject,
          status: EmailStatus.SENT,
          sentAt: new Date(),
          metadata: metadata || {},
        },
      });
    } catch (error) {
      this.logger.error(`❌ Error enviando email a ${to}:`, error.message);

      // Registrar error en DB
      await this.prisma.emailLog.create({
        data: {
          userId,
          to,
          type,
          subject,
          status: EmailStatus.FAILED,
          error: error.message,
          metadata: metadata || {},
        },
      });

      throw error;
    }
  }

  // ==========================================
  // EMAILS TRANSACCIONALES
  // ==========================================

  async sendVerificationEmail(
    to: string,
    firstName: string,
    verificationToken: string,
    userId: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${verificationToken}`;

    const html = verificationTemplate({
      firstName,
      verificationUrl,
    });

    await this.sendEmail(
      to,
      'Verifica tu email - María Victoria Seoane',
      html,
      EmailType.VERIFICATION,
      userId,
      { verificationToken },
    );
  }

  async sendWelcomeEmail(
    to: string,
    firstName: string,
    userId: string,
  ): Promise<void> {
    const coursesUrl = `${this.frontendUrl}/courses`;

    const html = welcomeTemplate({
      firstName,
      coursesUrl,
    });

    await this.sendEmail(
      to,
      '¡Bienvenido/a a María Victoria Seoane! 🎉',
      html,
      EmailType.WELCOME,
      userId,
    );
  }

  async sendPurchaseConfirmedEmail(
    to: string,
    firstName: string,
    orderId: string,
    courses: Array<{ title: string; price: number }>,
    subtotal: number,
    discount: number,
    total: number,
    userId: string,
  ): Promise<void> {
    const html = purchaseConfirmedTemplate({
      firstName,
      orderId,
      courses,
      subtotal,
      discount,
      total,
      currency: 'ARS',
    });

    await this.sendEmail(
      to,
      `Compra Confirmada - Orden #${orderId}`,
      html,
      EmailType.PURCHASE_CONFIRMED,
      userId,
      { orderId },
    );
  }

  async sendCourseAccessEmail(
    to: string,
    firstName: string,
    courses: Array<{
      title: string;
      accessUrl: string;
      username?: string;
      password?: string;
    }>,
    userId: string,
  ): Promise<void> {
    const html = courseAccessTemplate({
      firstName,
      courses,
    });

    await this.sendEmail(
      to,
      '¡Tu curso está listo! 🎓',
      html,
      EmailType.COURSE_ACCESS,
      userId,
      {
        courseCount: courses.length,
        courseTitles: courses.map((c) => c.title),
      },
    );
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
    userId: string,
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;

    const html = passwordResetTemplate({
      firstName,
      resetUrl,
    });

    await this.sendEmail(
      to,
      'Recuperar Contraseña',
      html,
      EmailType.PASSWORD_RESET,
      userId,
      { resetToken },
    );
  }

  async sendOrderCancelledEmail(
    to: string,
    firstName: string,
    orderId: string,
    reason: string,
    userId: string,
  ): Promise<void> {
    const html = orderCancelledTemplate({
      firstName,
      orderId,
      reason,
    });

    await this.sendEmail(
      to,
      `Orden #${orderId} Cancelada`,
      html,
      EmailType.ORDER_CANCELLED,
      userId,
      { orderId, reason },
    );
  }

  // ==========================================
  // EMAILS DE MARKETING
  // ==========================================

  async sendCartAbandonedEmail(
    stage: 1 | 2 | 3,
    to: string,
    firstName: string,
    cartItems: Array<{ title: string; price: number }>,
    total: number,
    userId: string,
    couponCode?: string,
    discount?: number,
  ): Promise<void> {
    let html: string;
    let subject: string;
    let type: EmailType;

    const cartUrl = `${this.frontendUrl}/cart`;

    if (stage === 1) {
      html = cartAbandoned1hTemplate({
        firstName,
        cartItems,
        cartUrl,
        total,
      });
      subject = '¿Olvidaste algo en tu carrito? 🛒';
      type = EmailType.CART_ABANDONED_1H;
    } else if (stage === 2) {
      html = cartAbandoned24hTemplate({
        firstName,
        cartItems,
        cartUrl,
        total,
        couponCode: couponCode!,
        discount: discount!,
      });
      subject = `Tu carrito + ${discount}% de descuento 🎁`;
      type = EmailType.CART_ABANDONED_24H;
    } else {
      html = cartAbandoned72hTemplate({
        firstName,
        cartItems,
        cartUrl,
        total,
        couponCode: couponCode!,
        discount: discount!,
      });
      subject = `Última oportunidad: ${discount}% de descuento`;
      type = EmailType.CART_ABANDONED_72H;
    }

    await this.sendEmail(to, subject, html, type, userId, {
      stage,
      total,
      itemCount: cartItems.length,
      couponCode,
    });
  }

  async sendNewCouponEmail(
    to: string,
    firstName: string,
    couponCode: string,
    discount: number,
    isPercentage: boolean,
    expiresAt: Date,
    userId: string,
  ): Promise<void> {
    const coursesUrl = `${this.frontendUrl}/courses`;

    const html = newCouponTemplate({
      firstName,
      couponCode,
      discount,
      isPercentage,
      expiresAt,
      coursesUrl,
    });

    const discountText = isPercentage ? `${discount}%` : `$${discount}`;

    await this.sendEmail(
      to,
      `Nuevo cupón: ${discountText} de descuento 🎉`,
      html,
      EmailType.NEW_COUPON,
      userId,
      { couponCode, discount, isPercentage },
    );
  }

  async sendBirthdayEmail(
    to: string,
    firstName: string,
    couponCode: string,
    discount: number,
    userId: string,
  ): Promise<void> {
    const coursesUrl = `${this.frontendUrl}/courses`;

    const html = birthdayTemplate({
      firstName,
      couponCode,
      discount,
      coursesUrl,
    });

    await this.sendEmail(
      to,
      `🎂 ¡Feliz Cumpleaños ${firstName}!`,
      html,
      EmailType.BIRTHDAY,
      userId,
      { couponCode, discount },
    );
  }

  // ==========================================
  // MÉTODOS ADMIN
  // ==========================================

  async getLogs(page = 1, limit = 20, type?: EmailType, status?: EmailStatus) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      this.prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.emailLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const [totalSent, pending, failed, opened, clicked] = await Promise.all([
      this.prisma.emailLog.count({
        where: { status: EmailStatus.SENT },
      }),
      this.prisma.emailLog.count({
        where: { status: EmailStatus.PENDING },
      }),
      this.prisma.emailLog.count({
        where: { status: EmailStatus.FAILED },
      }),
      this.prisma.emailLog.count({
        where: { status: EmailStatus.OPENED },
      }),
      this.prisma.emailLog.count({
        where: { status: EmailStatus.CLICKED },
      }),
    ]);

    const byType = await this.prisma.emailLog.groupBy({
      by: ['type'],
      _count: true,
    });

    return {
      totalSent,
      pending,
      failed,
      openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
