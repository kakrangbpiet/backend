import twilio from "twilio";
import config from "../config.js";
import { TwilioError } from "../DataTypes/enums/Error.js";

class TwilioOtpService {
    private twilioClient: twilio.Twilio;
    private serviceSid: string;
    private otpExpiryMinutes: number;
    private fromNumber: string;
    
    constructor() {
        try {
            if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) {
                throw TwilioError.MissingCredentials();
            }

            this.twilioClient = twilio(
                config.TWILIO_ACCOUNT_SID,
                config.TWILIO_AUTH_TOKEN
            );
            
            this.otpExpiryMinutes = parseInt(config.OTP_EXPIRY_MINUTES || "5");
            this.serviceSid = config.TWILIO_VERIFY_SERVICE_SID || (() => { throw TwilioError.MissingServiceSid(); })();
            this.fromNumber = config.TWILIO_FROM_NUMBER || (() => { throw TwilioError.MissingFromNumber(); })();
            
            if (!this.serviceSid) {
                throw TwilioError.MissingServiceSid();
            }

            if (!this.fromNumber) {
                throw TwilioError.MissingFromNumber();
            }
        } catch (error) {
            throw TwilioError.InitializationError(error);
        }
    }

    /**
     * Send OTP via Twilio Verify
     * @param phoneNumber Recipient phone number (without country code)
     * @returns Promise with transaction ID
     */
    async sendLoginOtp(phoneNumber: string): Promise<{ trxId: string }> {
        try {
            if (!phoneNumber) {
                throw TwilioError.InvalidPhoneNumber();
            }

            const formattedNumber = `+91${phoneNumber}`;
            
            const verification = await this.twilioClient.verify.v2.services(this.serviceSid)
                .verifications
                .create({
                    to: formattedNumber,
                    channel: 'sms'
                });

            return { 
                trxId: verification.sid 
            };
        } catch (error: any) {
            if (error.code === 60200) {
                throw TwilioError.InvalidPhoneNumber();
            } else if (error.code === 60203) {
                throw TwilioError.MaxAttemptsReached();
            } else if (error.code === 20404) {
                throw TwilioError.ServiceNotFound(this.serviceSid);
            }
            throw TwilioError.SendOtpError(error);
        }
    }

    /**
     * Verify OTP using Twilio Verify
     * @param phoneNumber Recipient phone number (without country code)
     * @param otp The OTP code to verify
     * @param trxId The transaction ID from sendLoginOtp
     * @returns Promise with verification status
     */
    async verifyLoginOtp(phoneNumber: string, otp: string, trxId?: string): Promise<boolean> {
        try {
            if (!phoneNumber || !otp) {
                throw TwilioError.InvalidVerificationParams();
            }

            const formattedNumber = `+91${phoneNumber}`;
            
            const verificationCheck = await this.twilioClient.verify.v2.services(this.serviceSid)
                .verificationChecks
                .create({
                    to: formattedNumber,
                    code: otp
                });

            if (verificationCheck.status === 'approved') {
                return true;
            }
            
            throw TwilioError.OtpVerificationFailed();
        } catch (error: any) {
            if (error.code === 60202) {
                throw TwilioError.InvalidOtp();
            } else if (error.code === 20404) {
                throw TwilioError.ServiceNotFound(this.serviceSid);
            } else if (error.code === 60200) {
                throw TwilioError.InvalidPhoneNumber();
            }
            console.log("error",error);
            
            throw TwilioError.VerificationError(error);
        }
    }

    /**
     * Send OTP directly via SMS (without Verify service)
     * @param phoneNumber Recipient phone number (without country code)
     * @returns Promise with transaction ID and OTP (for testing)
     */
    async sendDirectSmsOtp(phoneNumber: string): Promise<{ trxId: string, otp: string }> {
        try {
            if (!phoneNumber) {
                throw TwilioError.InvalidPhoneNumber();
            }

            const formattedNumber = `+91${phoneNumber}`;
            const otp = this.generateOtp(6);
            
            const message = await this.twilioClient.messages.create({
                body: `Your verification code is: ${otp}`,
                from: this.fromNumber,
                to: formattedNumber
            });

            return { 
                trxId: message.sid,
                otp: otp // Note: In production, don't return the OTP
            };
        } catch (error: any) {
            if (error.code === 21211) {
                throw TwilioError.InvalidPhoneNumber();
            } else if (error.code === 21608) {
                throw TwilioError.UnverifiedNumber();
            }
            throw TwilioError.SmsSendError(error);
        }
    }

    /**
     * Generate a random OTP code
     * @param length Length of OTP (default 6)
     * @returns Generated OTP string
     */
    private generateOtp(length: number = 6): string {
        const digits = '0123456789';
        let otp = '';
        
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        
        return otp;
    }

}

// Singleton export
export const twilioOtpService = new TwilioOtpService();