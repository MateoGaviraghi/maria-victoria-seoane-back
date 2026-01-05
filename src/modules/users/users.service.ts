import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User, Role, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Tipo de usuario sin password
export type UserWithoutPassword = Omit<User, 'password'>;

// Helper para excluir el password
export function excludePassword(user: User): UserWithoutPassword {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // BUSCAR POR EMAIL
  // ==========================================
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  // ==========================================
  // BUSCAR POR ID
  // ==========================================
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // ==========================================
  // BUSCAR POR GOOGLE ID
  // ==========================================
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { googleId },
    });
  }

  // ==========================================
  // CREAR USUARIO
  // ==========================================
  async create(data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: Role;
    authProvider?: AuthProvider;
    googleId?: string;
    avatarUrl?: string;
    emailVerified?: boolean;
  }): Promise<User> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    let hashedPassword: string | null = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || Role.STUDENT,
        authProvider: data.authProvider || AuthProvider.LOCAL,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        emailVerified: data.emailVerified || false,
      },
    });
  }

  // ==========================================
  // ACTUALIZAR USUARIO
  // ==========================================
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // ==========================================
  // ACTUALIZAR CONTRASEÑA
  // ==========================================
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  // ==========================================
  // VERIFICAR CONTRASEÑA
  // ==========================================
  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  // ==========================================
  // LISTAR USUARIOS (ADMIN)
  // ==========================================
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 10, search, role, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          role: true,
          studentStatus: true,
          authProvider: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // OBTENER PERFIL COMPLETO
  // ==========================================
  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        studentStatus: true,
        authProvider: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          where: { status: 'COMPLETED' },
          include: {
            items: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnailUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // ==========================================
  // DESACTIVAR USUARIO
  // ==========================================
  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  }

  // ==========================================
  // ACTIVAR USUARIO
  // ==========================================
  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true });
  }

  // ==========================================
  // VERIFICAR EMAIL
  // ==========================================
  async markEmailAsVerified(id: string): Promise<User> {
    return this.update(id, { emailVerified: true });
  }

  // ==========================================
  // CAMBIAR ROL
  // ==========================================
  async changeRole(id: string, role: Role): Promise<User> {
    return this.update(id, { role });
  }

  // ==========================================
  // ELIMINAR USUARIO (SOFT DELETE)
  // ==========================================
  async softDelete(id: string): Promise<User> {
    return this.update(id, {
      isActive: false,
      email: `deleted_${Date.now()}_${id}@deleted.com`,
    });
  }

  // ==========================================
  // ESTADÍSTICAS DE USUARIOS (ADMIN)
  // ==========================================
  async getStats() {
    const [total, active, students, owners, verified] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { role: Role.OWNER } }),
      this.prisma.user.count({ where: { emailVerified: true } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      students,
      owners,
      verified,
      unverified: total - verified,
    };
  }
}
