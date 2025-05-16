/*
  Warnings:

  - You are about to drop the column `notes` on the `Meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "notes";

-- CreateTable
CREATE TABLE "MeetingNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "meetingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingNote_meetingId_idx" ON "MeetingNote"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingNote_authorId_idx" ON "MeetingNote"("authorId");

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
