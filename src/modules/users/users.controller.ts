import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService, excludePassword } from './users.service';
import {
  UpdateUserDto,
  AdminUpdateUserDto,
  UserResponseDto,
  UserListResponseDto,
  ChangeRoleDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ==========================================
  // OBTENER MI PERFIL
  // ==========================================
  @Get('me')
  @ApiOperation({ summary: 'Obtener mi perfil' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  // ==========================================
  // ACTUALIZAR MI PERFIL
  // ==========================================
  @Put('me')
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    // Eliminar campos que el usuario no puede modificar
    const { role: _role, ...safeData } = dto as UpdateUserDto & {
      role?: unknown;
    };
    const user = await this.usersService.update(userId, safeData);
    return excludePassword(user);
  }

  // ==========================================
  // LISTAR USUARIOS (OWNER/SUPER_ADMIN)
  // ==========================================
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Listar usuarios (admin)' })
  @ApiResponse({ status: 200, type: UserListResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      role,
      isActive,
    });
  }

  // ==========================================
  // ESTADÍSTICAS DE USUARIOS (OWNER/SUPER_ADMIN)
  // ==========================================
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Estadísticas de usuarios (admin)' })
  async getStats() {
    return this.usersService.getStats();
  }

  // ==========================================
  // OBTENER USUARIO POR ID (OWNER/SUPER_ADMIN)
  // ==========================================
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getProfile(id);
  }

  // ==========================================
  // ACTUALIZAR USUARIO (OWNER/SUPER_ADMIN)
  // ==========================================
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario (admin)' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    return excludePassword(user);
  }

  // ==========================================
  // DESACTIVAR USUARIO (OWNER/SUPER_ADMIN)
  // ==========================================
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Desactivar usuario (admin)' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.deactivate(id);
    return excludePassword(user);
  }

  // ==========================================
  // ACTIVAR USUARIO (OWNER/SUPER_ADMIN)
  // ==========================================
  @Put(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activar usuario (admin)' })
  @ApiResponse({ status: 200, description: 'Usuario activado' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.activate(id);
    return excludePassword(user);
  }

  // ==========================================
  // CAMBIAR ROL (SUPER_ADMIN only)
  // ==========================================
  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cambiar rol de usuario (super admin)' })
  @ApiResponse({ status: 200, description: 'Rol actualizado' })
  async changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
  ) {
    const user = await this.usersService.changeRole(id, dto.role);
    return excludePassword(user);
  }
}
