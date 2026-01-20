import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CouponsService } from '../coupons/coupons.service';
import {
  CheckoutDto,
  ValidateCheckoutDto,
  CheckoutResponseDto,
  CheckoutValidationResponseDto,
  CheckoutSummaryDto,
} from './dto/checkout.dto';
import {
  OrderStatus,
  PaymentStatus,
  StudentStatus,
  Prisma,
} from '@prisma/client';

// Interfaces para MercadoPago
interface MercadoPagoPreference {
  id: string;
  init_point: string;
}

interface MercadoPagoError {
  message?: string;
  error?: string;
}

// Tipo para orden con items (usa Prisma.Decimal)
type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

// Interface para items del carrito
interface CartItemForCheckout {
  courseId: string;
  courseTitle: string;
  price: number;
  discountPrice?: number;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly couponsService: CouponsService,
    private readonly configService: ConfigService,
  ) {}

  // ==========================================
  // VALIDAR CHECKOUT (Pre-checkout)
  // ==========================================
  async validateCheckout(
    userId: string,
    dto: ValidateCheckoutDto,
  ): Promise<CheckoutValidationResponseDto> {
    const errors: string[] = [];

    // Validar DNI
    if (!/^[0-9]{7,8}$/.test(dto.dni)) {
      errors.push('DNI debe tener 7 u 8 dígitos');
    }

    // Validar teléfono
    if (!dto.phone || dto.phone.length < 8) {
      errors.push('Teléfono inválido');
    }

    // Obtener carrito
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      errors.push('Tu carrito está vacío');
    }

    const summary: CheckoutSummaryDto = {
      items: cart.items.map((item) => ({
        courseId: item.courseId,
        title: item.courseTitle,
        price: item.discountPrice || item.price,
      })),
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      discount: cart.discount,
      couponCode: cart.coupon?.code,
      total: cart.total,
      currency: cart.currency,
    };

    return {
      valid: errors.length === 0,
      canProceed: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      summary,
    };
  }

  // ==========================================
  // CREAR ORDEN Y PREFERENCIA DE PAGO
  // ==========================================
  async createCheckout(
    userId: string,
    dto: CheckoutDto,
  ): Promise<CheckoutResponseDto> {
    // Obtener carrito
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Tu carrito está vacío');
    }

    // Validar cupón si se proporciona
    let couponId: string | null = null;
    let discount = 0;

    if (dto.couponCode) {
      const couponValidation = await this.couponsService.validateCoupon(
        {
          code: dto.couponCode,
          courseIds: cart.items.map((i) => i.courseId),
          subtotal: cart.subtotal,
        },
        userId,
      );

      if (!couponValidation.valid) {
        throw new BadRequestException(
          couponValidation.message || 'Cupón no válido',
        );
      }

      discount = couponValidation.discountAmount || 0;

      // Obtener ID del cupón
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });
      couponId = coupon?.id || null;
    }

    const subtotal = cart.subtotal;
    const total = Math.max(0, subtotal - discount);

    // Crear orden en transacción
    const order = await this.prisma.$transaction(async (tx) => {
      // Actualizar datos del usuario si no los tiene
      await tx.user.update({
        where: { id: userId },
        data: {
          phone: dto.phone,
          dni: dto.dni,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          studentStatus: StudentStatus.PENDING_PAYMENT,
        },
      });

      // Crear orden
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          subtotal,
          discountAmount: discount,
          total,
          currency: 'ARS',
          couponId,
          customerEmail: dto.email,
          customerPhone: dto.phone,
          customerDni: dto.dni,
          notes: dto.notes,
          items: {
            create: cart.items.map((item) => ({
              courseId: item.courseId,
              price: item.discountPrice || item.price,
              title: item.courseTitle,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    // Crear preferencia de MercadoPago
    const { paymentUrl, preferenceId } = await this.createMercadoPagoPreference(
      order,
      dto,
      cart.items,
    );

    // Guardar preference ID en payment
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        status: PaymentStatus.PENDING,
        amount: total,
        currency: 'ARS',
        mercadoPagoPreference: preferenceId,
      },
    });

    return {
      orderId: order.id,
      paymentUrl,
      preferenceId,
      summary: {
        items: cart.items.map((item) => ({
          courseId: item.courseId,
          title: item.courseTitle,
          price: item.discountPrice || item.price,
        })),
        itemCount: cart.itemCount,
        subtotal,
        discount,
        couponCode: dto.couponCode,
        total,
        currency: 'ARS',
      },
    };
  }

  // ==========================================
  // CREAR PREFERENCIA DE MERCADOPAGO
  // ==========================================
  private async createMercadoPagoPreference(
    order: OrderWithItems,
    dto: CheckoutDto,
    cartItems: CartItemForCheckout[],
  ): Promise<{ paymentUrl: string; preferenceId: string }> {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );

    if (!accessToken || accessToken.startsWith('tu_')) {
      // Si no hay token configurado, devolver URLs de prueba
      console.warn('⚠️ MercadoPago no configurado. Usando URLs de prueba.');
      return {
        paymentUrl: `${this.configService.get('FRONTEND_URL')}/checkout/pending?order=${order.id}`,
        preferenceId: `test_preference_${order.id}`,
      };
    }

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );

    // En desarrollo local, no usar MercadoPago real (a menos que FORCE_MERCADOPAGO=true)
    const forceMercadoPago =
      this.configService.get('FORCE_MERCADOPAGO') === 'true';
    const isDevelopment =
      !forceMercadoPago &&
      (this.configService.get('NODE_ENV') === 'development' ||
        frontendUrl.includes('localhost'));

    if (isDevelopment) {
      console.warn(
        '⚠️ Modo desarrollo: MercadoPago deshabilitado. Use POST /payments/simulate/:orderId para simular pagos.',
      );
      console.warn(
        '💡 Para probar con MercadoPago real, agrega FORCE_MERCADOPAGO=true en .env',
      );
      return {
        paymentUrl: `${frontendUrl}/checkout/pending?order=${order.id}`,
        preferenceId: `dev_preference_${order.id}`,
      };
    }

    // Items para MercadoPago
    const items = cartItems.map((item) => ({
      id: item.courseId,
      title: item.courseTitle,
      description: `Curso: ${item.courseTitle}`,
      quantity: 1,
      unit_price: item.discountPrice || item.price,
      currency_id: 'ARS',
    }));

    // Datos del comprador
    const payer = {
      name: dto.firstName,
      surname: dto.lastName,
      email: dto.email,
      phone: {
        number: dto.phone,
      },
      identification: {
        type: 'DNI',
        number: dto.dni,
      },
    };

    // URLs de retorno
    const backUrls = {
      success: `${frontendUrl}/checkout/success?order=${order.id}`,
      failure: `${frontendUrl}/checkout/failure?order=${order.id}`,
      pending: `${frontendUrl}/checkout/pending?order=${order.id}`,
    };

    // Crear preferencia
    try {
      const response = await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            items,
            payer,
            back_urls: backUrls,
            auto_return: 'approved',
            external_reference: order.id,
            notification_url: `${this.configService.get('API_URL', 'http://localhost:3000')}/api/payments/webhook/mercadopago`,
            statement_descriptor: 'CURSOS ONLINE',
          }),
        },
      );

      if (!response.ok) {
        const error = (await response.json()) as MercadoPagoError;
        console.error('Error MercadoPago:', error);
        throw new BadRequestException('Error al crear preferencia de pago');
      }

      const preference = (await response.json()) as MercadoPagoPreference;

      return {
        paymentUrl: preference.init_point,
        preferenceId: preference.id,
      };
    } catch (error) {
      console.error('Error al crear preferencia de MercadoPago:', error);
      throw new BadRequestException('Error al procesar el pago');
    }
  }

  // ==========================================
  // OBTENER RESUMEN DE CHECKOUT
  // ==========================================
  async getCheckoutSummary(userId: string): Promise<CheckoutSummaryDto> {
    const cart = await this.cartService.getCart(userId);

    return {
      items: cart.items.map((item) => ({
        courseId: item.courseId,
        title: item.courseTitle,
        price: item.discountPrice || item.price,
      })),
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      discount: cart.discount,
      couponCode: cart.coupon?.code,
      total: cart.total,
      currency: cart.currency,
    };
  }
}
