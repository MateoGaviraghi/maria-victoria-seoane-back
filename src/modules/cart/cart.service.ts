import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddToCartDto,
  ApplyCouponDto,
  CartResponseDto,
  CartItemResponseDto,
  CartItemAddedResponseDto,
  CartItemRemovedResponseDto,
  CouponAppliedResponseDto,
  CartCouponDto,
} from './dto/cart.dto';
import { StudentStatus, Coupon, Prisma } from '@prisma/client';

// Tipo para el item del carrito con curso incluido
type CartItemWithCourse = Prisma.CartItemGetPayload<{
  include: {
    course: {
      select: {
        id: true;
        title: true;
        slug: true;
        thumbnailUrl: true;
        price: true;
        discountPrice: true;
      };
    };
  };
}>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // OBTENER CARRITO
  // ==========================================
  async getCart(userId: string): Promise<CartResponseDto> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            price: true,
            discountPrice: true,
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    return this.buildCartResponse(cartItems);
  }

  // ==========================================
  // AGREGAR AL CARRITO
  // ==========================================
  async addToCart(
    userId: string,
    dto: AddToCartDto,
  ): Promise<CartItemAddedResponseDto> {
    const { courseId } = dto;

    // Verificar que el curso existe y está publicado
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        price: true,
        discountPrice: true,
        isPublished: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (!course.isPublished) {
      throw new BadRequestException('Este curso no está disponible');
    }

    // Verificar si ya está en el carrito
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingItem) {
      throw new ConflictException('Este curso ya está en tu carrito');
    }

    // Verificar si el usuario ya compró este curso
    const alreadyPurchased = await this.prisma.orderItem.findFirst({
      where: {
        courseId,
        order: {
          userId,
          status: 'COMPLETED',
        },
      },
    });

    if (alreadyPurchased) {
      throw new ConflictException('Ya has comprado este curso');
    }

    // Agregar al carrito
    const cartItem = await this.prisma.cartItem.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            price: true,
            discountPrice: true,
          },
        },
      },
    });

    // Actualizar estado del usuario a IN_CART si es REGISTERED
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        studentStatus: StudentStatus.IN_CART,
      },
    });

    const item = this.mapCartItem(cartItem);
    const cart = await this.getCart(userId);

    return {
      message: 'Curso agregado al carrito',
      item,
      cart,
    };
  }

  // ==========================================
  // QUITAR DEL CARRITO
  // ==========================================
  async removeFromCart(
    userId: string,
    courseId: string,
  ): Promise<CartItemRemovedResponseDto> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Este curso no está en tu carrito');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    // Verificar si el carrito quedó vacío y actualizar estado
    const remainingItems = await this.prisma.cartItem.count({
      where: { userId },
    });

    if (remainingItems === 0) {
      // Verificar si el usuario tiene órdenes completadas
      const hasCompletedOrders = await this.prisma.order.findFirst({
        where: { userId, status: 'COMPLETED' },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          studentStatus: hasCompletedOrders
            ? StudentStatus.PAID
            : StudentStatus.REGISTERED,
        },
      });
    }

    const cart = await this.getCart(userId);

    return {
      message: 'Curso eliminado del carrito',
      cart,
    };
  }

  // ==========================================
  // VACIAR CARRITO
  // ==========================================
  async clearCart(userId: string): Promise<CartResponseDto> {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    // Verificar si el usuario tiene órdenes completadas
    const hasCompletedOrders = await this.prisma.order.findFirst({
      where: { userId, status: 'COMPLETED' },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        studentStatus: hasCompletedOrders
          ? StudentStatus.PAID
          : StudentStatus.REGISTERED,
      },
    });

    return this.getCart(userId);
  }

  // ==========================================
  // APLICAR CUPÓN
  // ==========================================
  async applyCoupon(
    userId: string,
    dto: ApplyCouponDto,
  ): Promise<CouponAppliedResponseDto> {
    const { code } = dto;

    // Buscar cupón
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('Cupón no válido');
    }

    // Validar cupón
    await this.validateCoupon(coupon, userId);

    // Calcular descuento
    const cart = await this.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Tu carrito está vacío');
    }

    // Verificar compra mínima
    if (coupon.minPurchase && cart.subtotal < Number(coupon.minPurchase)) {
      throw new BadRequestException(
        `Compra mínima requerida: $${String(coupon.minPurchase)}`,
      );
    }

    const discountAmount = this.calculateDiscount(coupon, cart.subtotal);

    const couponDto: CartCouponDto = {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount,
    };

    // Nota: El cupón se guarda temporalmente en sesión/frontend
    // Se aplica definitivamente al crear la orden en checkout

    return {
      message: 'Cupón aplicado correctamente',
      coupon: couponDto,
      cart: {
        ...cart,
        coupon: couponDto,
        discount: discountAmount,
        total: cart.subtotal - discountAmount,
      },
    };
  }

  // ==========================================
  // VALIDAR CUPÓN
  // ==========================================
  async validateCoupon(coupon: Coupon, userId: string): Promise<void> {
    // Verificar si está activo
    if (!coupon.isActive) {
      throw new BadRequestException('Este cupón no está activo');
    }

    // Verificar fecha de validez
    const now = new Date();
    if (coupon.validFrom > now) {
      throw new BadRequestException('Este cupón aún no es válido');
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      throw new BadRequestException('Este cupón ha expirado');
    }

    // Verificar límite de usos totales
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      throw new BadRequestException(
        'Este cupón ha alcanzado el límite de usos',
      );
    }

    // Verificar límite de usos por usuario
    const userUsage = await this.prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    });

    if (userUsage >= coupon.maxUsesPerUser) {
      throw new BadRequestException('Ya has usado este cupón');
    }
  }

  // ==========================================
  // CALCULAR DESCUENTO
  // ==========================================
  private calculateDiscount(coupon: Coupon, subtotal: number): number {
    let discount = 0;

    if (coupon.type === 'PERCENTAGE') {
      discount = (subtotal * Number(coupon.value)) / 100;
      // Aplicar máximo si existe
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      // FIXED
      discount = Number(coupon.value);
    }

    // El descuento no puede ser mayor al subtotal
    return Math.min(discount, subtotal);
  }

  // ==========================================
  // OBTENER CANTIDAD DE ITEMS
  // ==========================================
  async getCartItemCount(userId: string): Promise<number> {
    return this.prisma.cartItem.count({
      where: { userId },
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private buildCartResponse(cartItems: CartItemWithCourse[]): CartResponseDto {
    const items: CartItemResponseDto[] = cartItems.map((item) =>
      this.mapCartItem(item),
    );

    const subtotal = items.reduce((sum, item) => {
      return sum + (item.discountPrice || item.price);
    }, 0);

    return {
      items,
      itemCount: items.length,
      subtotal,
      discount: 0,
      total: subtotal,
      currency: 'ARS',
    };
  }

  private mapCartItem(item: CartItemWithCourse): CartItemResponseDto {
    return {
      id: item.id,
      courseId: item.course.id,
      courseTitle: item.course.title,
      courseSlug: item.course.slug,
      courseThumbnail: item.course.thumbnailUrl ?? undefined,
      price: Number(item.course.price),
      discountPrice: item.course.discountPrice
        ? Number(item.course.discountPrice)
        : undefined,
      addedAt: item.addedAt,
    };
  }
}
