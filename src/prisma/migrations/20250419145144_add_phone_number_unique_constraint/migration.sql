-- CreateTable
CREATE TABLE "DateAvailability" (
    "id" TEXT NOT NULL,
    "startDate" INTEGER NOT NULL,
    "endDate" INTEGER NOT NULL,
    "maxTravelers" INTEGER NOT NULL,
    "availableSpots" INTEGER NOT NULL,
    "travelPackageId" TEXT NOT NULL,

    CONSTRAINT "DateAvailability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DateAvailability" ADD CONSTRAINT "DateAvailability_travelPackageId_fkey" FOREIGN KEY ("travelPackageId") REFERENCES "travel_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
