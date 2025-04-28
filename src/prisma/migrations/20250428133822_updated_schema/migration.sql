/*
  Warnings:

  - You are about to drop the column `inquiryId` on the `travel_bookings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `travel_inquiries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `totalAmount` to the `travel_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "travel_bookings_inquiryId_key";

-- AlterTable
ALTER TABLE "payment_info" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "paymentDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "travel_bookings" DROP COLUMN "inquiryId",
ADD COLUMN     "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "travel_inquiries" ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "travel_inquiries_bookingId_key" ON "travel_inquiries"("bookingId");

-- AddForeignKey
ALTER TABLE "travel_inquiries" ADD CONSTRAINT "travel_inquiries_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "travel_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_info" ADD CONSTRAINT "payment_info_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "travel_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
