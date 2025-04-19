/*
  Warnings:

  - You are about to drop the column `travelDates` on the `travel_inquiries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "travel_inquiries" DROP COLUMN "travelDates",
ADD COLUMN     "endDate" INTEGER,
ADD COLUMN     "startDate" INTEGER,
ADD COLUMN     "tripType" TEXT NOT NULL DEFAULT 'pre-planned';
