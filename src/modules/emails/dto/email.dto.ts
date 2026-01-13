import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { EmailType, EmailStatus } from '@prisma/client';

// ==========================================
// REQUEST DTOs
// ==========================================

export class SendTestEmailDto {
  @ApiProperty({ description: 'Email destino', example: 'test@email.com' })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Tipo de email a probar',
    enum: EmailType,
    example: EmailType.WELCOME,
  })
  @IsEnum(EmailType)
  type: EmailType;
}

export class SendCampaignDto {
  @ApiProperty({
    description: 'Asunto del email',
    example: '¡Nueva promoción disponible!',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Contenido HTML del email',
    example: '<h1>Hola!</h1><p>Tenemos un nuevo curso...</p>',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Filtro de usuarios (all, students, paid)',
    example: 'all',
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class EmailLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  to: string;

  @ApiProperty({ enum: EmailType })
  type: EmailType;

  @ApiProperty()
  subject: string;

  @ApiProperty({ enum: EmailStatus })
  status: EmailStatus;

  @ApiPropertyOptional()
  sentAt?: Date;

  @ApiPropertyOptional()
  openedAt?: Date;

  @ApiPropertyOptional()
  clickedAt?: Date;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  createdAt: Date;
}

export class EmailStatsDto {
  @ApiProperty({ description: 'Total de emails enviados' })
  totalSent: number;

  @ApiProperty({ description: 'Emails pendientes' })
  pending: number;

  @ApiProperty({ description: 'Emails fallidos' })
  failed: number;

  @ApiProperty({ description: 'Tasa de apertura (%)' })
  openRate: number;

  @ApiProperty({ description: 'Tasa de clicks (%)' })
  clickRate: number;

  @ApiProperty({ description: 'Por tipo de email' })
  byType: Record<string, number>;
}
