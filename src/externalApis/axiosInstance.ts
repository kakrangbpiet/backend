import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import config from '../config.js';

export const otpAxiosInstance: AxiosInstance = axios.create({
    baseURL: config.OTP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// export const emailAxiosInstance: AxiosInstance = axios.create({
//     baseURL: config.EMAIL_API_URL, // Make sure this URL is correct
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

otpAxiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => Promise.reject(error)
);

// emailAxiosInstance.interceptors.response.use(
//     (response: AxiosResponse) => response,
//     (error: AxiosError) => Promise.reject(error)
// );


export const formatOtpResponse = (response: any) => ({
    success: true,
    data: response.data.data,
    error: null,
    code: response.status,
});

export const formatOtpError = (error: any) => {
    const response = error.response || {};
    
    return {
        success: false,
        data: response.data.data,
        message: response.data.error,
        statusCode: response.data.code || 500,
        details:""
    };
};