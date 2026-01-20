import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  PaymentFilterDto,
  MercadoPagoWebhookDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  PaymentStatsResponseDto,
  WebhookResponseDto,
} from './dto/payments.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ==========================================
  // WEBHOOK DE MERCADOPAGO (Público)
  // ==========================================
  @Post('webhook/mercadopago')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de MercadoPago' })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado',
    type: WebhookResponseDto,
  })
  async mercadoPagoWebhook(
    @Body() webhook: MercadoPagoWebhookDto,
  ): Promise<WebhookResponseDto> {
    try {
      await this.paymentsService.processWebhook(webhook);
      return { success: true, message: 'Webhook procesado correctamente' };
    } catch (error) {
      console.error('Error procesando webhook:', error);
      return { success: false, message: 'Error procesando webhook' };
    }
  }

  // ==========================================
  // SIMULAR APROBACIÓN (Solo desarrollo)
  // ==========================================
  @Post('simulate/:orderId')
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simular aprobación de pago (desarrollo)' })
  @ApiResponse({
    status: 200,
    description: 'Pago simulado como aprobado',
    type: PaymentResponseDto,
  })
  async simulatePayment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.simulatePaymentApproval(orderId);
  }

  // ==========================================
  // ADMIN: OBTENER TODOS LOS PAGOS
  // ==========================================
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los pagos (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos',
    type: PaymentListResponseDto,
  })
  async findAll(
    @Query() dto: PaymentFilterDto,
  ): Promise<PaymentListResponseDto> {
    return this.paymentsService.findAll(dto);
  }

  // ==========================================
  // ADMIN: ESTADÍSTICAS
  // ==========================================
  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estadísticas de pagos (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
    type: PaymentStatsResponseDto,
  })
  async getStats(): Promise<PaymentStatsResponseDto> {
    return this.paymentsService.getStats();
  }

  // ==========================================
  // OBTENER PAGO POR ID
  // ==========================================
  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener pago por ID' })
  @ApiResponse({
    status: 200,
    description: 'Pago encontrado',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.findById(id);
  }
}
