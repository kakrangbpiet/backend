/*
  Warnings:

  - You are about to drop the column `departure` on the `travel_inquiries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "travel_inquiries" DROP COLUMN "departure",
ADD COLUMN     "address" TEXT NOT NULL DEFAULT '';
