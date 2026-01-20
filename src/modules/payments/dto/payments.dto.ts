import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

// ==========================================
// REQUEST DTOs
// ==========================================

export class PaymentFilterDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'ID del usuario' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Fecha desde' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

// ==========================================
// WEBHOOK DTOs
// ==========================================

export class MercadoPagoWebhookDto {
  @ApiProperty()
  action: string;

  @ApiProperty()
  api_version: string;

  @ApiProperty()
  data: {
    id: string;
  };

  @ApiProperty()
  date_created: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  live_mode: boolean;

  @ApiProperty()
  type: string;

  @ApiProperty()
  user_id: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  mercadoPagoId?: string;

  @ApiPropertyOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  paymentType?: string;

  @ApiPropertyOptional()
  installments?: number;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaymentListResponseDto {
  @ApiProperty({ type: [PaymentResponseDto] })
  payments: PaymentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PaymentStatsResponseDto {
  @ApiProperty()
  totalPayments: number;

  @ApiProperty()
  approvedPayments: number;

  @ApiProperty()
  pendingPayments: number;

  @ApiProperty()
  rejectedPayments: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  averageAmount: number;
}

export class WebhookResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
