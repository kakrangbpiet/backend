/*
  Warnings:

  - You are about to drop the column `phone` on the `Meeting` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Meeting_phone_idx";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "phone",
ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Meeting_phoneNumber_idx" ON "Meeting"("phoneNumber");
