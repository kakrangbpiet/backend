/*
  Warnings:

  - You are about to drop the column `base64Data` on the `TravelVideo` table. All the data in the column will be lost.
  - Added the required column `awsUrl` to the `TravelVideo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TravelVideo" DROP COLUMN "base64Data",
ADD COLUMN     "awsUrl" TEXT NOT NULL;
