import {
  Controller,
  Get,
  Post,
  Put,
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
import { CouponsService } from './coupons.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  CouponResponseDto,
  CouponListResponseDto,
  CouponValidationResponseDto,
  CouponStatsResponseDto,
} from './dto/coupons.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // ==========================================
  // VALIDAR CUPÓN (Público o autenticado)
  // ==========================================
  @Post('validate')
  @Public()
  @ApiOperation({ summary: 'Validar un cupón' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de validación',
    type: CouponValidationResponseDto,
  })
  async validateCoupon(
    @Body() dto: ValidateCouponDto,
    @CurrentUser('id') userId?: string,
  ): Promise<CouponValidationResponseDto> {
    return this.couponsService.validateCoupon(dto, userId);
  }

  // ==========================================
  // CRUD ADMIN (Solo SUPER_ADMIN y OWNER)
  // ==========================================

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear cupón' })
  @ApiResponse({
    status: 201,
    description: 'Cupón creado',
    type: CouponResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Código duplicado' })
  async create(@Body() dto: CreateCouponDto): Promise<CouponResponseDto> {
    return this.couponsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los cupones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cupones',
    type: CouponListResponseDto,
  })
  async findAll(): Promise<CouponListResponseDto> {
    return this.couponsService.findAll();
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estadísticas de cupones' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
    type: CouponStatsResponseDto,
  })
  async getStats(): Promise<CouponStatsResponseDto> {
    return this.couponsService.getStats();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener cupón por ID' })
  @ApiResponse({
    status: 200,
    description: 'Cupón encontrado',
    type: CouponResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CouponResponseDto> {
    return this.couponsService.findById(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar cupón' })
  @ApiResponse({
    status: 200,
    description: 'Cupón actualizado',
    type: CouponResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar cupón' })
  @ApiResponse({ status: 200, description: 'Cupón eliminado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.couponsService.delete(id);
    return { message: 'Cupón eliminado correctamente' };
  }
}
