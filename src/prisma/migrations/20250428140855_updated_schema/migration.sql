/*
  Warnings:

  - You are about to drop the `payment_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `travel_bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `travel_inquiries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payment_info" DROP CONSTRAINT "payment_info_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "travel_inquiries" DROP CONSTRAINT "travel_inquiries_bookingId_fkey";

-- DropTable
DROP TABLE "payment_info";

-- DropTable
DROP TABLE "travel_bookings";

-- DropTable
DROP TABLE "travel_inquiries";

-- CreateTable
CREATE TABLE "TravelInquiry" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageTitle" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "address" TEXT,
    "passengerCount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "tripType" TEXT NOT NULL,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentInfoId" TEXT,

    CONSTRAINT "TravelInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInfo" (
    "id" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelInquiry_paymentInfoId_key" ON "TravelInquiry"("paymentInfoId");

-- AddForeignKey
ALTER TABLE "TravelInquiry" ADD CONSTRAINT "TravelInquiry_paymentInfoId_fkey" FOREIGN KEY ("paymentInfoId") REFERENCES "PaymentInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
