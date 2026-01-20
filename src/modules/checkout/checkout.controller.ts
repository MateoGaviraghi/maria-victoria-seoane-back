import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import {
  CheckoutDto,
  ValidateCheckoutDto,
  CheckoutResponseDto,
  CheckoutValidationResponseDto,
  CheckoutSummaryDto,
} from './dto/checkout.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Checkout')
@Controller('checkout')
@ApiBearerAuth()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  // ==========================================
  // OBTENER RESUMEN DE CHECKOUT
  // ==========================================
  @Get('summary')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener resumen del checkout' })
  @ApiResponse({
    status: 200,
    description: 'Resumen del carrito para checkout',
    type: CheckoutSummaryDto,
  })
  async getSummary(
    @CurrentUser('id') userId: string,
  ): Promise<CheckoutSummaryDto> {
    return this.checkoutService.getCheckoutSummary(userId);
  }

  // ==========================================
  // VALIDAR DATOS DE CHECKOUT
  // ==========================================
  @Post('validate')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Validar datos antes de checkout' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de validación',
    type: CheckoutValidationResponseDto,
  })
  async validateCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: ValidateCheckoutDto,
  ): Promise<CheckoutValidationResponseDto> {
    return this.checkoutService.validateCheckout(userId, dto);
  }

  // ==========================================
  // CREAR CHECKOUT (Orden + Preferencia MP)
  // ==========================================
  @Post()
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear orden y obtener URL de pago' })
  @ApiResponse({
    status: 201,
    description: 'Orden creada, redirigir a MercadoPago',
    type: CheckoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Carrito vacío o datos inválidos' })
  async createCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: CheckoutDto,
  ): Promise<CheckoutResponseDto> {
    return this.checkoutService.createCheckout(userId, dto);
  }
}
