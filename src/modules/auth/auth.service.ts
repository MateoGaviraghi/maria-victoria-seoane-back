import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { EmailsService } from '../emails/emails.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { AuthResponseDto, AuthUserResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private emailsService: EmailsService,
  ) {}

  // ==========================================
  // REGISTRO
  // ==========================================
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'STUDENT',
        studentStatus: 'REGISTERED',
        authProvider: 'LOCAL',
      },
    });

    // Crear token de verificación de email
    const verificationToken = await this.createEmailVerificationToken(user.id);

    // Enviar email de verificación
    try {
      await this.emailsService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
        user.id,
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
      // No bloqueamos el registro si falla el email
    }

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  // ==========================================
  // LOGIN
  // ==========================================
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Esta cuenta fue creada con Google. Por favor, iniciá sesión con Google.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  // ==========================================
  // GOOGLE OAUTH
  // ==========================================
  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (user) {
      // Usuario existe - actualizar googleId si no lo tiene
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            avatarUrl: user.avatarUrl || googleUser.avatarUrl,
            emailVerified: true,
            lastLoginAt: new Date(),
          },
        });
      } else {
        // Solo actualizar último login
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
    } else {
      // Crear nuevo usuario
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          googleId: googleUser.googleId,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          avatarUrl: googleUser.avatarUrl,
          role: 'STUDENT',
          studentStatus: 'REGISTERED',
          authProvider: 'GOOGLE',
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  // ==========================================
  // REFRESH TOKEN
  // ==========================================
  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Buscar el refresh token en la base de datos
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (storedToken.isRevoked) {
      throw new UnauthorizedException('Refresh token revocado');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Revocar el token actual
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generar nuevos tokens
    return this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revocar token específico
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken },
        data: { isRevoked: true },
      });
    } else {
      // Revocar todos los tokens del usuario
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // No revelar si el email existe o no
    if (!user) {
      return;
    }

    if (user.authProvider === 'GOOGLE' && !user.password) {
      // Usuario creado con Google, no tiene password
      return;
    }

    // Crear token de reset
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email con link de reset
    try {
      await this.emailsService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        token,
        user.id,
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const resetToken = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Este token ya fue utilizado');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('El token ha expirado');
    }

    // Hashear nueva password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Actualizar password y marcar token como usado
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revocar todos los refresh tokens
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId },
        data: { isRevoked: true },
      }),
    ]);
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.password) {
      throw new BadRequestException(
        'No podés cambiar la contraseña de una cuenta creada con Google',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // ==========================================
  // VERIFY EMAIL
  // ==========================================
  async verifyEmail(token: string): Promise<void> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Token de verificación inválido');
    }

    if (verification.usedAt) {
      throw new BadRequestException('Este email ya fue verificado');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('El token de verificación ha expirado');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Enviar email de bienvenida
    try {
      await this.emailsService.sendWelcomeEmail(
        verification.user.email,
        verification.user.firstName,
        verification.user.id,
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  // ==========================================
  // RESEND VERIFICATION EMAIL
  // ==========================================
  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    // Invalidar tokens anteriores
    await this.prisma.emailVerification.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Crear nuevo token
    await this.createEmailVerificationToken(userId);

    // TODO: Enviar email
  }

  // ==========================================
  // HELPERS PRIVADOS
  // ==========================================
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    // Crear refresh token
    const refreshToken = uuidv4();
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresAt = this.calculateExpiration(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private calculateExpiration(duration: string): Date {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 días
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }

  private async createEmailVerificationToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await this.prisma.emailVerification.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  private formatUserResponse(user: User): AuthUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      studentStatus: user.studentStatus,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
