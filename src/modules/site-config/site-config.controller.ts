import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SiteConfigService } from './site-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  UpdateConfigDto,
  EmailConfigDto,
  ConfigResponseDto,
  ConfigListResponseDto,
  EmailConfigResponseDto,
} from './dto/site-config.dto';

@ApiTags('Site Config')
@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  // ==========================================
  // ADMIN - CONFIGURACIÓN GENERAL
  // ==========================================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las configuraciones (Admin)' })
  @ApiResponse({ status: 200, type: ConfigListResponseDto })
  async getAllConfigs() {
    const configs = await this.siteConfigService.findAll();
    return { configs };
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener configuración por clave (Admin)' })
  @ApiResponse({ status: 200, type: ConfigResponseDto })
  async getConfigByKey(@Param('key') key: string) {
    return this.siteConfigService.findByKey(key);
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración por clave (Admin)' })
  @ApiResponse({ status: 200, type: ConfigResponseDto })
  async updateConfig(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    return this.siteConfigService.updateByKey(key, dto.value);
  }

  // ==========================================
  // ADMIN - CONFIGURACIÓN DE EMAILS
  // ==========================================

  @Get('emails/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener configuración de emails (Admin)' })
  @ApiResponse({ status: 200, type: EmailConfigResponseDto })
  async getEmailConfig() {
    return this.siteConfigService.getEmailConfig();
  }

  @Put('emails/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración de emails (Admin)' })
  @ApiResponse({ status: 200, type: EmailConfigResponseDto })
  async updateEmailConfig(@Body() dto: EmailConfigDto) {
    return this.siteConfigService.updateEmailConfig(dto);
  }
}
