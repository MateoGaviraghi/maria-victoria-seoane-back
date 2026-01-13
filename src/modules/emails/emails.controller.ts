import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EmailsService } from './emails.service';
import {
  SendTestEmailDto,
  SendCampaignDto,
  EmailLogDto,
  EmailStatsDto,
} from './dto/email.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, EmailType, EmailStatus } from '@prisma/client';

@ApiTags('Emails')
@Controller('emails')
@ApiBearerAuth()
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  // ==========================================
  // ENDPOINTS ADMIN
  // ==========================================

  @Get('logs')
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener historial de emails enviados' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: EmailType })
  @ApiQuery({ name: 'status', required: false, enum: EmailStatus })
  @ApiResponse({
    status: 200,
    description: 'Lista de emails con paginación',
  })
  async getLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('type') type?: EmailType,
    @Query('status') status?: EmailStatus,
  ) {
    return this.emailsService.getLogs(page, limit, type, status);
  }

  @Get('stats')
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Estadísticas de emails' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de envío de emails',
    type: EmailStatsDto,
  })
  async getStats(): Promise<EmailStatsDto> {
    return this.emailsService.getStats();
  }

  @Post('test')
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Enviar email de prueba' })
  @ApiResponse({ status: 200, description: 'Email de prueba enviado' })
  async sendTestEmail(
    @Body() dto: SendTestEmailDto,
    @CurrentUser('id') userId: string,
  ) {
    // Simular datos según el tipo - usando el userId del usuario autenticado
    const testData = {
      [EmailType.VERIFICATION]: {
        method: 'sendVerificationEmail',
        args: [dto.to, 'Usuario Test', 'test-token-123', userId],
      },
      [EmailType.WELCOME]: {
        method: 'sendWelcomeEmail',
        args: [dto.to, 'Usuario Test', userId],
      },
      [EmailType.PURCHASE_CONFIRMED]: {
        method: 'sendPurchaseConfirmedEmail',
        args: [
          dto.to,
          'Usuario Test',
          'ORDER-123',
          [
            { title: 'Curso de Ejemplo', price: 15000 },
            { title: 'Otro Curso', price: 20000 },
          ],
          35000,
          5000,
          30000,
          userId,
        ],
      },
      [EmailType.COURSE_ACCESS]: {
        method: 'sendCourseAccessEmail',
        args: [
          dto.to,
          'Usuario Test',
          [
            {
              title: 'Curso de Ejemplo',
              accessUrl: 'https://plataforma.com/curso1',
              username: 'usuario_test',
              password: 'password123',
            },
          ],
          userId,
        ],
      },
      [EmailType.PASSWORD_RESET]: {
        method: 'sendPasswordResetEmail',
        args: [dto.to, 'Usuario Test', 'reset-token-123', userId],
      },
      [EmailType.ORDER_CANCELLED]: {
        method: 'sendOrderCancelledEmail',
        args: [dto.to, 'Usuario Test', 'ORDER-123', 'Pago rechazado', userId],
      },
      [EmailType.CART_ABANDONED_1H]: {
        method: 'sendCartAbandonedEmail',
        args: [
          1,
          dto.to,
          'Usuario Test',
          [{ title: 'Curso Abandonado', price: 15000 }],
          15000,
          userId,
        ],
      },
      [EmailType.CART_ABANDONED_24H]: {
        method: 'sendCartAbandonedEmail',
        args: [
          2,
          dto.to,
          'Usuario Test',
          [{ title: 'Curso Abandonado', price: 15000 }],
          15000,
          userId,
          'DESCUENTO10',
          10,
        ],
      },
      [EmailType.CART_ABANDONED_72H]: {
        method: 'sendCartAbandonedEmail',
        args: [
          3,
          dto.to,
          'Usuario Test',
          [{ title: 'Curso Abandonado', price: 15000 }],
          15000,
          userId,
          'DESCUENTO15',
          15,
        ],
      },
      [EmailType.NEW_COUPON]: {
        method: 'sendNewCouponEmail',
        args: [
          dto.to,
          'Usuario Test',
          'NUEVO2024',
          20,
          true,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userId,
        ],
      },
      [EmailType.BIRTHDAY]: {
        method: 'sendBirthdayEmail',
        args: [dto.to, 'Usuario Test', 'CUMPLE2024', 20, userId],
      },
    };

    const test = testData[dto.type];
    if (test) {
      await this.emailsService[test.method](...test.args);
    }

    return {
      message: 'Email de prueba enviado',
      type: dto.type,
      to: dto.to,
    };
  }
}
