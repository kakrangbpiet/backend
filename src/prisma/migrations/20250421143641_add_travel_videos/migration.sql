-- CreateTable
CREATE TABLE "TravelVideo" (
    "id" TEXT NOT NULL,
    "base64Data" TEXT NOT NULL,
    "travelPackageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelVideo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TravelVideo" ADD CONSTRAINT "TravelVideo_travelPackageId_fkey" FOREIGN KEY ("travelPackageId") REFERENCES "travel_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
