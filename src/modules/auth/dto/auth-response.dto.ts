import { ApiProperty } from '@nestjs/swagger';
import { Role, StudentStatus } from '.prisma/client';

export class AuthUserResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'juan@email.com' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({
    example: 'STUDENT',
    enum: ['SUPER_ADMIN', 'OWNER', 'STUDENT'],
  })
  role: Role;

  @ApiProperty({
    example: 'REGISTERED',
    enum: [
      'REGISTERED',
      'IN_CART',
      'PENDING_PAYMENT',
      'PAID',
      'IN_PROGRESS',
      'COMPLETED',
    ],
  })
  studentStatus: StudentStatus;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: 'uuid-123',
      email: 'juan@email.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'STUDENT',
    },
  })
  user: AuthUserResponseDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operación exitosa' })
  message: string;
}
