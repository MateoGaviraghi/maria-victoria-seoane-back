import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanTestData() {
  console.log('🧹 Limpiando datos de prueba...\n');

  // Eliminar en orden correcto por dependencias
  const cartItems = await prisma.cartItem.deleteMany();
  console.log(`✅ CartItems eliminados: ${cartItems.count}`);

  const couponUsages = await prisma.couponUsage.deleteMany();
  console.log(`✅ CouponUsages eliminados: ${couponUsages.count}`);

  const courseCoupons = await prisma.courseCoupon.deleteMany();
  console.log(`✅ CourseCoupons eliminados: ${courseCoupons.count}`);

  const payments = await prisma.payment.deleteMany();
  console.log(`✅ Payments eliminados: ${payments.count}`);

  const orderItems = await prisma.orderItem.deleteMany();
  console.log(`✅ OrderItems eliminados: ${orderItems.count}`);

  const orders = await prisma.order.deleteMany();
  console.log(`✅ Orders eliminados: ${orders.count}`);

  const coupons = await prisma.coupon.deleteMany();
  console.log(`✅ Coupons eliminados: ${coupons.count}`);

  console.log('\n✨ Limpieza completada!');
  await prisma.$disconnect();
}

cleanTestData().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
