/*
  Warnings:

  - You are about to drop the column `originalPrice` on the `travel_packages` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `travel_packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "travel_packages" DROP COLUMN "originalPrice",
DROP COLUMN "price";
