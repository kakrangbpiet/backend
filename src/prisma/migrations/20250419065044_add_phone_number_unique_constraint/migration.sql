/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `superAdmin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "superAdmin" ADD COLUMN     "phoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "superAdmin_phoneNumber_key" ON "superAdmin"("phoneNumber");
