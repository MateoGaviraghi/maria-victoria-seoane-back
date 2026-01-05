import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString } from 'class-validator';

// ==========================================
// REQUEST DTOs
// ==========================================

export class AddToCartDto {
  @ApiProperty({
    description: 'ID del curso a agregar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}

export class ApplyCouponDto {
  @ApiProperty({
    description: 'Código del cupón',
    example: 'DESCUENTO20',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  courseSlug: string;

  @ApiPropertyOptional()
  courseThumbnail?: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  discountPrice?: number;

  @ApiProperty()
  addedAt: Date;
}

export class CartCouponDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  discountAmount: number;
}

export class CartResponseDto {
  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  subtotal: number;

  @ApiPropertyOptional({ type: CartCouponDto })
  coupon?: CartCouponDto;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  currency: string;
}

export class CartItemAddedResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: CartItemResponseDto })
  item: CartItemResponseDto;

  @ApiProperty({ type: CartResponseDto })
  cart: CartResponseDto;
}

export class CartItemRemovedResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: CartResponseDto })
  cart: CartResponseDto;
}

export class CouponAppliedResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: CartCouponDto })
  coupon: CartCouponDto;

  @ApiProperty({ type: CartResponseDto })
  cart: CartResponseDto;
}
