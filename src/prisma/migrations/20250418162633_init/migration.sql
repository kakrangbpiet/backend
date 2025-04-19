-- CreateTable
CREATE TABLE "superAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "superAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samsarauser" (
    "id" TEXT NOT NULL,
    "accountStatus" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "roleId" TEXT,
    "razorpayPayments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cartItems" JSONB[] DEFAULT ARRAY[]::JSONB[],

    CONSTRAINT "samsarauser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unverifiedsamsarauser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phoneNumber" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unverifiedsamsarauser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_packages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "image" TEXT NOT NULL,
    "images" TEXT[],
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "maxTravelers" INTEGER,
    "availableSpots" INTEGER,
    "travelType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_inquiries" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageTitle" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "passengerCount" INTEGER NOT NULL,
    "travelDates" TEXT NOT NULL,
    "specialRequests" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_bookings" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "userId" TEXT,
    "passengerCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_info" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "superAdmin_email_key" ON "superAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "superAdmin_category_key" ON "superAdmin"("category");

-- CreateIndex
CREATE UNIQUE INDEX "samsarauser_email_key" ON "samsarauser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "samsarauser_phoneNumber_key" ON "samsarauser"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "unverifiedsamsarauser_phoneNumber_key" ON "unverifiedsamsarauser"("phoneNumber");

-- CreateIndex
CREATE INDEX "travel_packages_status_idx" ON "travel_packages"("status");

-- CreateIndex
CREATE INDEX "travel_packages_category_idx" ON "travel_packages"("category");

-- CreateIndex
CREATE INDEX "travel_packages_location_idx" ON "travel_packages"("location");

-- CreateIndex
CREATE INDEX "travel_packages_status_category_idx" ON "travel_packages"("status", "category");

-- CreateIndex
CREATE UNIQUE INDEX "travel_bookings_inquiryId_key" ON "travel_bookings"("inquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_info_bookingId_key" ON "payment_info"("bookingId");
