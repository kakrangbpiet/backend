// import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
// import config from "../config.js";

// class AwsOtpService {
//     private snsClient: SNSClient;
//     private otpExpiryMinutes: number;
//     private otpMap: Map<string, { otp: string; expiresAt: number }>; // In-memory storage (replace with Redis in production)
    
//     constructor() {
//         if (!config.AWS_ACCESS_KEY_ID || !config.AWS_SECRET_ACCESS_KEY) {
//             throw new Error("AWS credentials are not configured.");
//         }

//         this.snsClient = new SNSClient({ 
//             region: config.AWS_REGION || "us-east-1",
//             credentials: {
//                 accessKeyId: config.AWS_ACCESS_KEY_ID,
//                 secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
//             }
//         });
        
//         this.otpExpiryMinutes = parseInt(config.OTP_EXPIRY_MINUTES || "5"); // Default 5 mins
//         this.otpMap = new Map(); // Temporary storage (use Redis/DynamoDB in production)
//     }

//     // Generate a random OTP
//     private generateOtp(length: number = 6): string {
//         return Math.floor(100000 + Math.random() * 900000).toString().slice(0, length);
//     }

//     // Send OTP via AWS SNS
//     async sendLoginOtp(phoneNumber: string): Promise<{ trxId: string }> {
//         const otp = this.generateOtp();
//         const trxId = `trx_${Math.random().toString(36).slice(2, 11)}`;
//         const expiresAt = Date.now() + this.otpExpiryMinutes * 60 * 1000;

//         // Store OTP temporarily (replace with a database in production)
//         this.otpMap.set(trxId, { otp, expiresAt });

//         try {
//             const params = {
//                 Message: `Your OTP is ${otp}. Valid for ${this.otpExpiryMinutes} minutes.`,
//                 PhoneNumber: `+91${phoneNumber}`, // E.164 format
//                 MessageAttributes: {
//                     'AWS.SNS.SMS.SMSType': {
//                         DataType: 'String',
//                         StringValue: 'Transactional' // Higher delivery rate for OTPs
//                     }
//                 }
//             };

//             const command = new PublishCommand(params);
//             await this.snsClient.send(command);
            
//             return { trxId };
//         } catch (error) {
//             console.error("AWS SNS Error:", error);
//             throw new Error("Failed to send OTP. Check AWS configuration.");
//         }
//     }

//     // Verify OTP
//     async verifyLoginOtp(phoneNumber: string, otp: string, trxId: string): Promise<boolean> {
//         const storedData = this.otpMap.get(trxId);
        
//         if (!storedData || storedData.expiresAt < Date.now()) {
//             return false; // OTP expired or invalid trxId
//         }

//         if (storedData.otp === otp) {
//             this.otpMap.delete(trxId); // Clear OTP after successful verification
//             return true;
//         }

//         return false;
//     }
// }

// // Singleton export
// export const awsOtpService = new AwsOtpService();