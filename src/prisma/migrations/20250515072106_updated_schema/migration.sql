-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "meetingDateTime" TIMESTAMP(3) NOT NULL,
    "meetingType" TEXT NOT NULL,
    "topics" TEXT[],
    "agreeTerms" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "parentMeetingId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_email_idx" ON "Meeting"("email");

-- CreateIndex
CREATE INDEX "Meeting_phone_idx" ON "Meeting"("phone");

-- CreateIndex
CREATE INDEX "Meeting_meetingDateTime_idx" ON "Meeting"("meetingDateTime");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Meeting_parentMeetingId_idx" ON "Meeting"("parentMeetingId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_parentMeetingId_fkey" FOREIGN KEY ("parentMeetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
