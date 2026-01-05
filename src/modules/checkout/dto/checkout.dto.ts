import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
  IsDateString,
} from 'class-validator';

// ==========================================
// REQUEST DTOs
// ==========================================

export class CheckoutDto {
  @ApiProperty({ description: 'Nombre del comprador', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Apellido del comprador', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email del comprador',
    example: 'juan@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Teléfono del comprador',
    example: '+5491123456789',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'DNI del comprador', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,8}$/, { message: 'DNI debe tener 7 u 8 dígitos' })
  dni: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Código de cupón aplicado',
    example: 'DESCUENTO20',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ValidateCheckoutDto {
  @ApiProperty({ description: 'DNI del comprador', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,8}$/, { message: 'DNI debe tener 7 u 8 dígitos' })
  dni: string;

  @ApiProperty({
    description: 'Teléfono del comprador',
    example: '+5491123456789',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class CheckoutItemDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;
}

export class CheckoutSummaryDto {
  @ApiProperty({ type: [CheckoutItemDto] })
  items: CheckoutItemDto[];

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  discount: number;

  @ApiPropertyOptional()
  couponCode?: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  currency: string;
}

export class CheckoutResponseDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty({ description: 'URL de MercadoPago para pagar' })
  paymentUrl: string;

  @ApiProperty({ description: 'ID de preferencia de MercadoPago' })
  preferenceId: string;

  @ApiProperty({ type: CheckoutSummaryDto })
  summary: CheckoutSummaryDto;
}

export class CheckoutValidationResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty()
  canProceed: boolean;

  @ApiPropertyOptional({ type: [String] })
  errors?: string[];

  @ApiPropertyOptional({ type: CheckoutSummaryDto })
  summary?: CheckoutSummaryDto;
}
