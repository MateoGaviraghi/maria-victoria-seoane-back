import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsNumber, Min, Max } from 'class-validator';

// ==========================================
// REQUEST DTOs
// ==========================================

export class UpdateConfigDto {
  @ApiProperty({ description: 'Valor de la configuración (JSON)' })
  @IsObject()
  @IsNotEmpty()
  value: Record<string, any>;
}

export class EmailConfigDto {
  @ApiProperty({
    description: 'Horas para primer email de carrito abandonado',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(168) // máximo 1 semana
  cartAbandoned1hHours: number;

  @ApiProperty({
    description: 'Horas para segundo email con cupón 10%',
    example: 24,
  })
  @IsNumber()
  @Min(1)
  @Max(168)
  cartAbandoned24hHours: number;

  @ApiProperty({
    description: 'Horas para tercer email con cupón 15%',
    example: 72,
  })
  @IsNumber()
  @Min(1)
  @Max(336) // máximo 2 semanas
  cartAbandoned72hHours: number;

  @ApiProperty({
    description: 'Porcentaje descuento primer cupón',
    example: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  firstCouponDiscount: number;

  @ApiProperty({
    description: 'Porcentaje descuento segundo cupón',
    example: 15,
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  secondCouponDiscount: number;

  @ApiProperty({
    description: 'Emails de carrito abandonado habilitados',
    example: true,
  })
  cartAbandonedEnabled: boolean;

  @ApiProperty({
    description: 'Emails de cumpleaños habilitados',
    example: true,
  })
  birthdayEmailsEnabled: boolean;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class ConfigResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: Record<string, any>;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  updatedAt: Date;
}

export class ConfigListResponseDto {
  @ApiProperty({ type: [ConfigResponseDto] })
  configs: ConfigResponseDto[];
}

export class EmailConfigResponseDto {
  @ApiProperty()
  cartAbandoned1hHours: number;

  @ApiProperty()
  cartAbandoned24hHours: number;

  @ApiProperty()
  cartAbandoned72hHours: number;

  @ApiProperty()
  firstCouponDiscount: number;

  @ApiProperty()
  secondCouponDiscount: number;

  @ApiProperty()
  cartAbandonedEnabled: boolean;

  @ApiProperty()
  birthdayEmailsEnabled: boolean;
}
