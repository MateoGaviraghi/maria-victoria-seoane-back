import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  OrderFilterDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsResponseDto,
} from './dto/orders.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ==========================================
  // MIS ÓRDENES
  // ==========================================
  @Get('my')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener mis órdenes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes del usuario',
    type: OrderListResponseDto,
  })
  async getMyOrders(
    @CurrentUser('id') userId: string,
    @Query() dto: OrderFilterDto,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.getMyOrders(userId, dto);
  }

  // ==========================================
  // OBTENER ORDEN POR ID
  // ==========================================
  @Get(':id')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener orden por ID' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la orden',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin acceso' })
  async findById(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findById(orderId, userId, userRole);
  }

  // ==========================================
  // CANCELAR ORDEN
  // ==========================================
  @Patch(':id/cancel')
  @Roles(Role.STUDENT, Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cancelar orden (solo si está pendiente)' })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 403, description: 'No se puede cancelar' })
  async cancelOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancelOrder(orderId, userId, userRole);
  }

  // ==========================================
  // ADMIN: TODAS LAS ÓRDENES
  // ==========================================
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiOperation({ summary: 'Obtener todas las órdenes (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las órdenes',
    type: OrderListResponseDto,
  })
  async findAll(@Query() dto: OrderFilterDto): Promise<OrderListResponseDto> {
    return this.ordersService.findAll(dto);
  }

  // ==========================================
  // ADMIN: ESTADÍSTICAS
  // ==========================================
  @Get('admin/stats')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiOperation({ summary: 'Estadísticas de órdenes (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
    type: OrderStatsResponseDto,
  })
  async getStats(): Promise<OrderStatsResponseDto> {
    return this.ordersService.getStats();
  }
}
