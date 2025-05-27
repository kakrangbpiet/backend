import twilio from "twilio";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class OtpService {
  private twilioClient: twilio.Twilio;
  private fromNumber: string;
  private otpExpiryMinutes: number;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || "";
    this.otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "5");
  }

  private generateOtp(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  async sendOtp(
    to: string,
    otpType: "login" | "registration" | "password-reset"="login"
  ): Promise<any> {
    const otpCode = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes);

    // Save to database first
    const otpRecord = await prisma.otpVerification.create({
      data: {
        otpType,
        to,
        from: this.fromNumber,
        otpCode,
        expiresAt,
        verified: false,
        attempts: 0,
      },
    });

    try {
      // Send via Twilio
      await this.twilioClient.messages.create({
        body: `Your verification code is: ${otpCode}`,
        from: this.fromNumber,
        to: `+91${to}`, // Assuming Indian numbers
      });

      return otpRecord;
    } catch (error) {
      // If Twilio fails, delete the OTP record
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
      throw error;
    }
  }

  async verifyOtp(
    to: string,
    otpCode: string,
    otpType: "login" | "registration" | "password-reset"="login"
  ): Promise<boolean> {
    const now = new Date();

    // Find the most recent valid OTP for this recipient
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        to,
        otpType,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      throw new Error("OTP not found or expired");
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      throw new Error("Maximum attempts reached");
    }

    // Increment attempts
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });

    // Verify code
    if (otpRecord.otpCode !== otpCode) {
      throw new Error("Invalid OTP");
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    await prisma.otpVerification.deleteMany({
      where: {
        expiresAt: { lt: now },
        verified: false,
      },
    });
  }
}

export const otpService = new OtpService();