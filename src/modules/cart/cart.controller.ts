import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  ApplyCouponDto,
  CartResponseDto,
  CartItemAddedResponseDto,
  CartItemRemovedResponseDto,
  CouponAppliedResponseDto,
} from './dto/cart.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ==========================================
  // OBTENER MI CARRITO
  // ==========================================
  @Get()
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener mi carrito' })
  @ApiResponse({
    status: 200,
    description: 'Carrito del usuario',
    type: CartResponseDto,
  })
  async getCart(@CurrentUser('id') userId: string): Promise<CartResponseDto> {
    return this.cartService.getCart(userId);
  }

  // ==========================================
  // AGREGAR CURSO AL CARRITO
  // ==========================================
  @Post()
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Agregar curso al carrito' })
  @ApiResponse({
    status: 201,
    description: 'Curso agregado al carrito',
    type: CartItemAddedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  @ApiResponse({ status: 409, description: 'Curso ya en carrito o comprado' })
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToCartDto,
  ): Promise<CartItemAddedResponseDto> {
    return this.cartService.addToCart(userId, dto);
  }

  // ==========================================
  // QUITAR CURSO DEL CARRITO
  // ==========================================
  @Delete(':courseId')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Quitar curso del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Curso eliminado del carrito',
    type: CartItemRemovedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado en carrito' })
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<CartItemRemovedResponseDto> {
    return this.cartService.removeFromCart(userId, courseId);
  }

  // ==========================================
  // VACIAR CARRITO
  // ==========================================
  @Delete()
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Vaciar carrito' })
  @ApiResponse({
    status: 200,
    description: 'Carrito vaciado',
    type: CartResponseDto,
  })
  async clearCart(@CurrentUser('id') userId: string): Promise<CartResponseDto> {
    return this.cartService.clearCart(userId);
  }

  // ==========================================
  // APLICAR CUPÓN
  // ==========================================
  @Post('apply-coupon')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aplicar cupón de descuento' })
  @ApiResponse({
    status: 200,
    description: 'Cupón aplicado',
    type: CouponAppliedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cupón no válido' })
  @ApiResponse({
    status: 400,
    description: 'Cupón expirado o límite alcanzado',
  })
  async applyCoupon(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyCouponDto,
  ): Promise<CouponAppliedResponseDto> {
    return this.cartService.applyCoupon(userId, dto);
  }

  // ==========================================
  // OBTENER CANTIDAD DE ITEMS
  // ==========================================
  @Get('count')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener cantidad de items en carrito' })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de items',
  })
  async getCartCount(
    @CurrentUser('id') userId: string,
  ): Promise<{ count: number }> {
    const count = await this.cartService.getCartItemCount(userId);
    return { count };
  }
}
