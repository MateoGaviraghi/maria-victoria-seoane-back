/*
  Warnings:

  - You are about to drop the column `template` on the `email_logs` table. All the data in the column will be lost.
  - The `status` column on the `email_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `email_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('VERIFICATION', 'WELCOME', 'PURCHASE_CONFIRMED', 'COURSE_ACCESS', 'PASSWORD_RESET', 'ORDER_CANCELLED', 'CART_ABANDONED_1H', 'CART_ABANDONED_24H', 'CART_ABANDONED_72H', 'NEW_COUPON', 'COUPON_EXPIRING', 'BIRTHDAY', 'NEW_COURSE', 'RECOMPRA', 'ADMIN_NEW_SALE', 'ADMIN_NEW_USER', 'ADMIN_NEW_MESSAGE');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED');

-- AlterTable
ALTER TABLE "email_logs" DROP COLUMN "template",
ADD COLUMN     "clickedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "openedAt" TIMESTAMP(3),
ADD COLUMN     "type" "EmailType" NOT NULL,
ADD COLUMN     "userId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "sentAt" DROP NOT NULL,
ALTER COLUMN "sentAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
