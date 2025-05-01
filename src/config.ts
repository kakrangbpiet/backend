import dotenv from 'dotenv';
import path from 'path';
import 'dotenv/config'

const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`)
});

export default {
    // App Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 5000,
    
    // Authentication
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    
    // OTP Configuration
    OTP_API_URL: process.env.OTP_API_URL,
    API_KEY_OTP_SERVER: process.env.API_KEY_OTP_SERVER,
    OTP_EXPIRY_MINUTES: process.env.OTP_EXPIRY_MINUTES || "5",
    
    // AWS Configuration
    AWS_REGION: process.env.AWS_REGION, 
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,  
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY, 
    AWS_PINPOINT_APPLICATION_ID: process.env.AWS_PINPOINT_APPLICATION_ID,
    AWS_PINPOINT_ORIGINATION_ID: process.env.AWS_PINPOINT_ORIGINATION_ID,
    
    // Twilio Configuration
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    
    // WhatsApp Configuration
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || "",  
    PHONE_NUMBER: process.env.PHONE_NUMBER || "",  
    WHATSAPP_BUSINESS_ID: process.env.WHATSAPP_BUSINESS_ID || "",
    
    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    WEBSITE_URL: process.env.WEBSITE_URL,
};