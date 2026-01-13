import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailsService } from './emails.service';
import { SiteConfigService } from '../site-config/site-config.service';

@Injectable()
export class EmailsCronService {
  private readonly logger = new Logger(EmailsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailsService: EmailsService,
    private readonly siteConfigService: SiteConfigService,
  ) {}

  // ==========================================
  // CARRITO ABANDONADO - Ejecuta cada 30 minutos
  // Los intervalos son configurables desde admin
  // ==========================================
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkAbandonedCartsAll() {
    this.logger.log('Checking carritos abandonados...');

    // Obtener configuración actual
    const config = await this.siteConfigService.getCartAbandonedIntervals();

    if (!config.enabled) {
      this.logger.log('Emails de carrito abandonado deshabilitados');
      return;
    }

    // Procesar los 3 niveles de carrito abandonado
    await this.processAbandonedCarts1h(config.firstHours);
    await this.processAbandonedCarts24h(
      config.secondHours,
      config.firstDiscount,
    );
    await this.processAbandonedCarts72h(
      config.thirdHours,
      config.secondDiscount,
    );
  }

  // ==========================================
  // CARRITO ABANDONADO - PRIMER RECORDATORIO
  // ==========================================
  private async processAbandonedCarts1h(hoursThreshold: number) {
    this.logger.log(`Procesando carritos abandonados (>${hoursThreshold}h)...`);

    const thresholdTime = new Date(
      Date.now() - hoursThreshold * 60 * 60 * 1000,
    );

    // Buscar usuarios con items en carrito
    const usersWithAbandonedCarts = await this.prisma.user.findMany({
      where: {
        emailVerified: true,
        cartItems: {
          some: {
            addedAt: {
              lte: thresholdTime,
            },
          },
        },
      },
      include: {
        cartItems: {
          include: {
            course: true,
          },
        },
      },
      take: 50,
    });

    for (const user of usersWithAbandonedCarts) {
      // Verificar si ya se le envió este email
      const alreadySent = await this.prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'CART_ABANDONED_1H',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (alreadySent) continue;

      try {
        const cartItems = user.cartItems.map((item) => ({
          title: item.course.title,
          price: parseFloat(
            (item.course.discountPrice || item.course.price).toString(),
          ),
        }));

        const total = cartItems.reduce((sum, item) => sum + item.price, 0);

        await this.emailsService.sendCartAbandonedEmail(
          1,
          user.email,
          user.firstName,
          cartItems,
          total,
          user.id,
        );

        this.logger.log(
          `Email carrito abandonado (1er aviso) enviado a ${user.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando email a ${user.email}:`,
          error.message,
        );
      }
    }
  }

  // ==========================================
  // CARRITO ABANDONADO - SEGUNDO RECORDATORIO (con cupón)
  // ==========================================
  private async processAbandonedCarts24h(
    hoursThreshold: number,
    discountPercent: number,
  ) {
    this.logger.log(
      `Procesando carritos abandonados (>${hoursThreshold}h) con cupón ${discountPercent}%...`,
    );

    const thresholdTime = new Date(
      Date.now() - hoursThreshold * 60 * 60 * 1000,
    );

    const usersWithAbandonedCarts = await this.prisma.user.findMany({
      where: {
        emailVerified: true,
        cartItems: {
          some: {
            addedAt: {
              lte: thresholdTime,
            },
          },
        },
      },
      include: {
        cartItems: {
          include: {
            course: true,
          },
        },
      },
      take: 50,
    });

    for (const user of usersWithAbandonedCarts) {
      // Verificar si ya se le envió
      const alreadySent = await this.prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'CART_ABANDONED_24H',
          createdAt: {
            gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
        },
      });

      if (alreadySent) continue;

      // Verificar que ya recibió el primer email
      const firstEmailSent = await this.prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'CART_ABANDONED_1H',
        },
      });

      if (!firstEmailSent) continue;

      try {
        const cartItems = user.cartItems.map((item) => ({
          title: item.course.title,
          price: parseFloat(
            (item.course.discountPrice || item.course.price).toString(),
          ),
        }));

        const total = cartItems.reduce((sum, item) => sum + item.price, 0);

        const couponCode = `CARRITO${discountPercent}-${user.id.substring(0, 6).toUpperCase()}`;

        await this.emailsService.sendCartAbandonedEmail(
          2,
          user.email,
          user.firstName,
          cartItems,
          total,
          user.id,
          couponCode,
          discountPercent,
        );

        this.logger.log(
          `Email carrito abandonado (2do aviso) enviado a ${user.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando email a ${user.email}:`,
          error.message,
        );
      }
    }
  }

  // ==========================================
  // CARRITO ABANDONADO - TERCER RECORDATORIO (cupón mayor)
  // ==========================================
  private async processAbandonedCarts72h(
    hoursThreshold: number,
    discountPercent: number,
  ) {
    this.logger.log(
      `Procesando carritos abandonados (>${hoursThreshold}h) con cupón ${discountPercent}%...`,
    );

    const thresholdTime = new Date(
      Date.now() - hoursThreshold * 60 * 60 * 1000,
    );

    const usersWithAbandonedCarts = await this.prisma.user.findMany({
      where: {
        emailVerified: true,
        cartItems: {
          some: {
            addedAt: {
              lte: thresholdTime,
            },
          },
        },
      },
      include: {
        cartItems: {
          include: {
            course: true,
          },
        },
      },
      take: 50,
    });

    for (const user of usersWithAbandonedCarts) {
      // Verificar si ya se le envió
      const alreadySent = await this.prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'CART_ABANDONED_72H',
          createdAt: {
            gte: new Date(Date.now() - 96 * 60 * 60 * 1000),
          },
        },
      });

      if (alreadySent) continue;

      // Verificar que ya recibió los emails anteriores
      const secondEmailSent = await this.prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'CART_ABANDONED_24H',
        },
      });

      if (!secondEmailSent) continue;

      try {
        const cartItems = user.cartItems.map((item) => ({
          title: item.course.title,
          price: parseFloat(
            (item.course.discountPrice || item.course.price).toString(),
          ),
        }));

        const total = cartItems.reduce((sum, item) => sum + item.price, 0);

        const couponCode = `LASTCHANCE${discountPercent}-${user.id.substring(0, 6).toUpperCase()}`;

        await this.emailsService.sendCartAbandonedEmail(
          3,
          user.email,
          user.firstName,
          cartItems,
          total,
          user.id,
          couponCode,
          discountPercent,
        );

        this.logger.log(
          `Email carrito abandonado (3er aviso) enviado a ${user.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando email a ${user.email}:`,
          error.message,
        );
      }
    }
  }

  // ==========================================
  // CUMPLEAÑOS - Diario a las 8:00 AM
  // ==========================================
  @Cron('0 8 * * *')
  async sendBirthdayEmails() {
    this.logger.log('Checking cumpleaños de hoy...');

    // Verificar si está habilitado
    const isEnabled = await this.siteConfigService.isBirthdayEmailEnabled();
    if (!isEnabled) {
      this.logger.log('Emails de cumpleaños deshabilitados');
      return;
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Buscar usuarios con cumpleaños hoy
    const birthdayUsers = await this.prisma.$queryRaw<
      Array<{
        id: string;
        email: string;
        firstName: string;
        birthDate: Date;
      }>
    >`
      SELECT id, email, "firstName", "birthDate"
      FROM users
      WHERE EXTRACT(MONTH FROM "birthDate") = ${month}
        AND EXTRACT(DAY FROM "birthDate") = ${day}
        AND "emailVerified" = true
    `;

    for (const user of birthdayUsers) {
      // Verificar si ya se le envió este año
      const alreadySent = await this.prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'BIRTHDAY',
          createdAt: {
            gte: new Date(today.getFullYear(), 0, 1), // Desde inicio del año
          },
        },
      });

      if (alreadySent) continue;

      try {
        const couponCode = `CUMPLE${today.getFullYear()}-${user.id.substring(0, 6).toUpperCase()}`;

        await this.emailsService.sendBirthdayEmail(
          user.email,
          user.firstName,
          couponCode,
          20, // 20% de descuento
          user.id,
        );

        this.logger.log(`Email de cumpleaños enviado a ${user.email}`);
      } catch (error) {
        this.logger.error(
          `Error enviando email de cumpleaños a ${user.email}:`,
          error.message,
        );
      }
    }
  }

  // ==========================================
  // LIMPIAR LOGS ANTIGUOS - Semanal
  // ==========================================
  @Cron(CronExpression.EVERY_WEEK)
  async cleanOldEmailLogs() {
    this.logger.log('Limpiando logs de emails antiguos...');

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.emailLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
        status: {
          in: ['SENT', 'FAILED'],
        },
      },
    });

    this.logger.log(`${result.count} logs de emails eliminados`);
  }
}
