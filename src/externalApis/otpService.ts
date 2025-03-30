import { CommonError, ErrorEnum } from '../DataTypes/enums/Error.js';
import config from '../config.js';
import { formatOtpResponse, otpAxiosInstance } from './axiosInstance.js';
// Ensure proper configuration
const otpApiUrl = config.OTP_API_URL;
const otpApiKey = config.API_KEY_OTP_SERVER

if (!otpApiUrl) {
    throw new Error('Missing API configuration');
}

// Define interfaces for request data
export interface OtpRequestData {
    purpose: string;
    identifier?: string;
    deviceId: string;
    user?:string
}

interface VerifyOtpRequestData {
    otp: string;
    trxId: string;
    deviceId: string;
}

interface ResendOtpRequestData {
    trxId: string;
    deviceId: string;
}

// Function to send OTP
export const sendOtpRequest = async (data: OtpRequestData) => {
   
    if (!data?.identifier) {
        throw ErrorEnum.MissingEmail(); 
    }
    if (!data?.deviceId) {
        throw CommonError.MissingDeviceId();
    }

    const requestData: any = {
        purpose: data.purpose,
        deviceId: data.deviceId,
    };

    // Assign the correct identifier field
    if (data.identifier && data.identifier.includes('@')) {
        requestData.email = data.identifier;
        requestData.user = data.user
    } else {
        requestData.phoneNumber = data.identifier;
    }

    try {
        const response = await otpAxiosInstance.post('/generate', requestData, {
            headers: {
                'api-key': otpApiKey,
            },
        });
        return formatOtpResponse(response)
    } catch (error:any) {
        throw CommonError.OtpApiError(error?.response?.data || 'Error sending OTP');
    }
};

// Function to verify OTP
export const verifyOtpRequest = async (data: VerifyOtpRequestData) => {
    if (!data.otp) {
        throw CommonError.MissingOtp();
    }
    if (!data.trxId) {
        throw CommonError.MissingTransactionId();
    }
    if (!data.deviceId) {
        throw CommonError.MissingDeviceId();
    }

    try {
        // Ensure to use post method here
        const response = await otpAxiosInstance.post('/verify', data);

        return formatOtpResponse(response)

    } catch (error: any) {
        throw CommonError.OtpApiError(error?.response?.data || 'Error sending OTP');
    }
};

// Function to resend OTP
export const resendOtpRequest = async (data: ResendOtpRequestData) => {
    if (!data.trxId) {
        throw CommonError.MissingTransactionId();
    }
    if (!data.deviceId) {
        throw CommonError.MissingDeviceId();
    }

    try {
        const response = await otpAxiosInstance.post('/resend', data);

        return formatOtpResponse(response)
    } catch (error: any) {
        throw CommonError.OtpApiError(error?.response?.data || 'Error sending OTP');
    }
};