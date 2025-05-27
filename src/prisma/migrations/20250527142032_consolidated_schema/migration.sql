-- CreateTable
CREATE TABLE "superAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "permissions" TEXT[],
    "phoneNumber" TEXT,

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
    "activities" TEXT[],

    CONSTRAINT "travel_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelVideo" (
    "id" TEXT NOT NULL,
    "travelPackageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awsUrl" TEXT NOT NULL,

    CONSTRAINT "TravelVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DateAvailability" (
    "id" TEXT NOT NULL,
    "startDate" INTEGER NOT NULL,
    "endDate" INTEGER NOT NULL,
    "maxTravelers" INTEGER NOT NULL,
    "availableSpots" INTEGER NOT NULL,
    "travelPackageId" TEXT NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,

    CONSTRAINT "DateAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelInquiry" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageTitle" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "address" TEXT,
    "passengerCount" INTEGER NOT NULL,
    "tripType" TEXT NOT NULL,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentInfoId" TEXT,
    "startDate" INTEGER NOT NULL,
    "endDate" INTEGER NOT NULL,

    CONSTRAINT "TravelInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "meetingDateTime" TIMESTAMP(3) NOT NULL,
    "meetingType" TEXT NOT NULL,
    "topics" TEXT[],
    "agreeTerms" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "parentMeetingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "meetingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topic" TEXT NOT NULL DEFAULT 'General',

    CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInfo" (
    "id" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "otpType" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "message" TEXT,
    "otpCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "superAdmin_email_key" ON "superAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "superAdmin_phoneNumber_key" ON "superAdmin"("phoneNumber");

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
CREATE UNIQUE INDEX "TravelInquiry_paymentInfoId_key" ON "TravelInquiry"("paymentInfoId");

-- CreateIndex
CREATE INDEX "Meeting_email_idx" ON "Meeting"("email");

-- CreateIndex
CREATE INDEX "Meeting_phoneNumber_idx" ON "Meeting"("phoneNumber");

-- CreateIndex
CREATE INDEX "Meeting_meetingDateTime_idx" ON "Meeting"("meetingDateTime");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Meeting_parentMeetingId_idx" ON "Meeting"("parentMeetingId");

-- CreateIndex
CREATE INDEX "MeetingNote_meetingId_idx" ON "MeetingNote"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingNote_authorId_idx" ON "MeetingNote"("authorId");

-- CreateIndex
CREATE INDEX "OtpVerification_to_otpType_idx" ON "OtpVerification"("to", "otpType");

-- CreateIndex
CREATE INDEX "OtpVerification_expiresAt_idx" ON "OtpVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "OtpVerification_verified_idx" ON "OtpVerification"("verified");

-- AddForeignKey
ALTER TABLE "TravelVideo" ADD CONSTRAINT "TravelVideo_travelPackageId_fkey" FOREIGN KEY ("travelPackageId") REFERENCES "travel_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DateAvailability" ADD CONSTRAINT "DateAvailability_travelPackageId_fkey" FOREIGN KEY ("travelPackageId") REFERENCES "travel_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelInquiry" ADD CONSTRAINT "TravelInquiry_paymentInfoId_fkey" FOREIGN KEY ("paymentInfoId") REFERENCES "PaymentInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_parentMeetingId_fkey" FOREIGN KEY ("parentMeetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
