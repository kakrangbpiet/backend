/*
  Warnings:

  - Added the required column `startDate` to the `TravelInquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `TravelInquiry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TravelInquiry" DROP COLUMN "startDate",
ADD COLUMN     "startDate" INTEGER NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" INTEGER NOT NULL;
