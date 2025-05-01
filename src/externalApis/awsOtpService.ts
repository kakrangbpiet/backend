// import { PinpointClient, SendOTPMessageCommand, VerifyOTPMessageCommand } from "@aws-sdk/client-pinpoint";
// import config from "../config.js";

// class AwsOtpService {
//     private pinpointClient: PinpointClient;
//     private otpExpiryMinutes: number;
//     private applicationId: string;
//     private originationIdentity: string; // Updated from senderId (can be phone number/sender ID)
    
//     constructor() {
//         if (!config.AWS_ACCESS_KEY_ID || !config.AWS_SECRET_ACCESS_KEY) {
//             throw new Error("AWS credentials are not configured.");
//         }

//         this.pinpointClient = new PinpointClient({ 
//             region: config.AWS_REGION || "us-east-1", // Default fallback
//             credentials: {
//                 accessKeyId: config.AWS_ACCESS_KEY_ID,
//                 secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
//             }
//         });
        
//         this.otpExpiryMinutes = parseInt(config.OTP_EXPIRY_MINUTES || "5"); // Default 5 mins
//         this.applicationId = config.AWS_PINPOINT_APPLICATION_ID || (() => { throw new Error("AWS_PINPOINT_APPLICATION_ID is not defined."); })();
//         this.originationIdentity = config.AWS_PINPOINT_ORIGINATION_ID || (() => { throw new Error("AWS_PINPOINT_ORIGINATION_ID is not defined."); })(); // Sender ID/Phone Number
        
//         if (!this.applicationId || !this.originationIdentity) {
//             throw new Error("AWS Pinpoint Application ID or Origination Identity is missing.");
//         }
//     }

//     // Send OTP via AWS Pinpoint
//     async sendLoginOtp(phoneNumber: string): Promise<{ trxId: string }> {
//         const trxId = `trx_${Math.random().toString(36).slice(2, 11)}`; // Better random ID
        
//         try {
//             const params = {
//                 ApplicationId: this.applicationId,
//                 SendOTPMessageRequestParameters: {
//                     Channel: 'SMS',
//                     BrandName: "YourApp", // Optional: Brand name for SMS
//                     CodeLength: 6, // 6-digit OTP
//                     ValidityPeriod: this.otpExpiryMinutes * 60, // Convert to seconds
//                     DestinationIdentity: `+91${phoneNumber}`, // E.164 format
//                     OriginationIdentity: this.originationIdentity, // Sender ID/Phone
//                     ReferenceId: trxId,
//                     // EntityId and TemplateId are optional (if using templates)
//                 }
//             };

//             const command = new SendOTPMessageCommand(params);
//             await this.pinpointClient.send(command);
            
//             return { trxId };
//         } catch (error) {
//             console.error("AWS Pinpoint Error:", error);
//             throw new Error("Failed to send OTP. Check AWS configuration.");
//         }
//     }

//     // Verify OTP
//     async verifyLoginOtp(phoneNumber: string, otp: string, trxId: string): Promise<boolean> {
//         try {
//             const verifyParams = {
//                 ApplicationId: this.applicationId,
//                 VerifyOTPMessageRequestParameters: {
//                     DestinationIdentity: `+91${phoneNumber}`,
//                     Otp: otp,
//                     ReferenceId: trxId
//                 }
//             };

//             const command = new VerifyOTPMessageCommand(verifyParams);
//             const response = await this.pinpointClient.send(command);
            
//             return response.VerificationResponse?.Valid || false;
//         } catch (error) {
//             console.error("AWS Pinpoint Verification Error:", error);
//             return false;
//         }
//     }
// }

// // Singleton export
// export const awsOtpService = new AwsOtpService();