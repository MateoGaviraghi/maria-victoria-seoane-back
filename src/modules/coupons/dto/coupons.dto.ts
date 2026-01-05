import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUUID,
  Min,
  IsArray,
} from 'class-validator';
import { CouponType } from '@prisma/client';

// ==========================================
// REQUEST DTOs
// ==========================================

export class CreateCouponDto {
  @ApiProperty({
    description: 'Código único del cupón',
    example: 'DESCUENTO20',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: CouponType, description: 'Tipo de descuento' })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    description: 'Valor del descuento (% o monto fijo)',
    example: 20,
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({
    description: 'Compra mínima requerida',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiPropertyOptional({
    description: 'Descuento máximo (para porcentaje)',
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Límite total de usos', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({
    description: 'Límite de usos por usuario',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiPropertyOptional({ description: 'Fecha desde que es válido' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta que es válido' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Descripción del cupón' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'IDs de cursos específicos para el cupón',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds?: string[];
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ description: 'Código único del cupón' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ enum: CouponType, description: 'Tipo de descuento' })
  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @ApiPropertyOptional({ description: 'Valor del descuento' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ description: 'Compra mínima requerida' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiPropertyOptional({ description: 'Descuento máximo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Límite total de usos' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Límite de usos por usuario' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiPropertyOptional({ description: 'Fecha desde que es válido' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta que es válido' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Cupón activo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Descripción del cupón' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'IDs de cursos específicos' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds?: string[];
}

export class ValidateCouponDto {
  @ApiProperty({ description: 'Código del cupón', example: 'DESCUENTO20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'IDs de cursos en el carrito para validar',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds?: string[];

  @ApiPropertyOptional({
    description: 'Subtotal del carrito para validar mínimo',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class CouponResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: CouponType })
  type: CouponType;

  @ApiProperty()
  value: number;

  @ApiPropertyOptional()
  minPurchase?: number;

  @ApiPropertyOptional()
  maxDiscount?: number;

  @ApiPropertyOptional()
  maxUses?: number;

  @ApiProperty()
  maxUsesPerUser: number;

  @ApiProperty()
  currentUses: number;

  @ApiProperty()
  validFrom: Date;

  @ApiPropertyOptional()
  validUntil?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Cursos a los que aplica' })
  courses?: { id: string; title: string }[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CouponListResponseDto {
  @ApiProperty({ type: [CouponResponseDto] })
  coupons: CouponResponseDto[];

  @ApiProperty()
  total: number;
}

export class CouponValidationResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: CouponType })
  type: CouponType;

  @ApiProperty()
  value: number;

  @ApiPropertyOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Monto de descuento calculado' })
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Mensaje de error si no es válido' })
  message?: string;
}

export class CouponStatsResponseDto {
  @ApiProperty()
  totalCoupons: number;

  @ApiProperty()
  activeCoupons: number;

  @ApiProperty()
  totalUses: number;

  @ApiProperty()
  totalDiscount: number;
}
