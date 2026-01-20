import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailConfigDto, EmailConfigResponseDto } from './dto/site-config.dto';

// Claves de configuración predefinidas
export const CONFIG_KEYS = {
  EMAIL_CONFIG: 'EMAIL_CONFIG',
  SITE_NAME: 'SITE_NAME',
  CONTACT_EMAIL: 'CONTACT_EMAIL',
} as const;

// Valores por defecto de email
export const DEFAULT_EMAIL_CONFIG: EmailConfigResponseDto = {
  cartAbandoned1hHours: 1,
  cartAbandoned24hHours: 24,
  cartAbandoned72hHours: 72,
  firstCouponDiscount: 10,
  secondCouponDiscount: 15,
  cartAbandonedEnabled: true,
  birthdayEmailsEnabled: true,
};

@Injectable()
export class SiteConfigService implements OnModuleInit {
  private readonly logger = new Logger(SiteConfigService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Inicializar configuraciones por defecto al iniciar
    await this.initializeDefaultConfigs();
  }

  private async initializeDefaultConfigs() {
    const defaultConfigs = [
      {
        key: CONFIG_KEYS.EMAIL_CONFIG,
        value: DEFAULT_EMAIL_CONFIG,
        description: 'Configuración de emails automáticos y carrito abandonado',
      },
      {
        key: CONFIG_KEYS.SITE_NAME,
        value: { name: 'María Victoria Seoane' },
        description: 'Nombre del sitio',
      },
      {
        key: CONFIG_KEYS.CONTACT_EMAIL,
        value: { email: 'contacto@mariavictoriaseoane.com' },
        description: 'Email de contacto',
      },
    ];

    for (const config of defaultConfigs) {
      const existing = await this.prisma.siteConfig.findUnique({
        where: { key: config.key },
      });

      if (!existing) {
        await this.prisma.siteConfig.create({
          data: {
            key: config.key,
            value: config.value as object,
            description: config.description,
          },
        });
        this.logger.log(`Configuración '${config.key}' inicializada`);
      }
    }
  }

  // ==========================================
  // CRUD GENÉRICO
  // ==========================================

  async findAll() {
    return this.prisma.siteConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`Configuración '${key}' no encontrada`);
    }

    return config;
  }

  async updateByKey(key: string, value: Record<string, any>) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`Configuración '${key}' no encontrada`);
    }

    return this.prisma.siteConfig.update({
      where: { key },
      data: { value },
    });
  }

  // ==========================================
  // EMAIL CONFIG ESPECÍFICO
  // ==========================================

  async getEmailConfig(): Promise<EmailConfigResponseDto> {
    try {
      const config = await this.prisma.siteConfig.findUnique({
        where: { key: CONFIG_KEYS.EMAIL_CONFIG },
      });

      if (!config) {
        return DEFAULT_EMAIL_CONFIG;
      }

      // Merge con defaults para asegurar que todos los campos existan
      return {
        ...DEFAULT_EMAIL_CONFIG,
        ...(config.value as Record<string, any>),
      };
    } catch (error) {
      this.logger.error('Error obteniendo configuración de emails', error);
      return DEFAULT_EMAIL_CONFIG;
    }
  }

  async updateEmailConfig(
    dto: EmailConfigDto,
  ): Promise<EmailConfigResponseDto> {
    const valueAsJson = JSON.parse(JSON.stringify(dto));

    const config = await this.prisma.siteConfig.upsert({
      where: { key: CONFIG_KEYS.EMAIL_CONFIG },
      update: { value: valueAsJson },
      create: {
        key: CONFIG_KEYS.EMAIL_CONFIG,
        value: valueAsJson,
        description: 'Configuración de emails automáticos y carrito abandonado',
      },
    });

    return config.value as unknown as EmailConfigResponseDto;
  }

  // ==========================================
  // MÉTODOS DE CONVENIENCIA PARA CRON
  // ==========================================

  async getCartAbandonedIntervals() {
    const config = await this.getEmailConfig();
    return {
      firstHours: config.cartAbandoned1hHours,
      secondHours: config.cartAbandoned24hHours,
      thirdHours: config.cartAbandoned72hHours,
      firstDiscount: config.firstCouponDiscount,
      secondDiscount: config.secondCouponDiscount,
      enabled: config.cartAbandonedEnabled,
    };
  }

  async isBirthdayEmailEnabled(): Promise<boolean> {
    const config = await this.getEmailConfig();
    return config.birthdayEmailsEnabled;
  }

  async isCartAbandonedEnabled(): Promise<boolean> {
    const config = await this.getEmailConfig();
    return config.cartAbandonedEnabled;
  }
}
