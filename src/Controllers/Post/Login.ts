/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction, Request } from "express";
import bcrypt from 'bcrypt';
import { CommonError, ErrorEnum } from "../../DataTypes/enums/Error.js";
import winston from 'winston';
import { LoginUserRequest } from "../../Middleware/UserExist.js";
import { OtpRequestData, resendOtpRequest, sendOtpRequest, verifyOtpRequest } from "../../externalApis/otpService.js";
import { ResetPasswordValidation, UpdatePasswordValidation } from "../../Validation/UserValidation.js";
import { encryptPassword } from "../../Utils/scripts/encryptPassword.js";
import { RequestWithUser } from "../../Middleware/checkJwt.js";
import { RequestWithIdentifier } from "../../Middleware/CheckIdentifier.js";
import { otpPurpose } from "../../DataTypes/enums/IUserEnums.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
import { prisma } from "../../Utils/db/client.js";
import { generateTokens, refreshAccessToken } from "../../Utils/scripts/jwtToken.js";

export const login = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { password, deviceId } = req.body;
    const userInfo = req.user;
    const identifier = req.identifier
    try {
        if (userInfo) {
            logWithMessageAndStep(childLogger, "Step 1", "Reading password from Body", "login", JSON.stringify(req.body), "info");

            // Compare passwords
            const isPasswordMatch = await bcrypt.compare(password, userInfo.password);
            logWithMessageAndStep(childLogger, "Step 2", "Comparing passwords", "login", JSON.stringify(isPasswordMatch), "debug");

            if (!isPasswordMatch) {
                logWithMessageAndStep(childLogger, "Error Step", "Password mismatch", "login", userInfo.email, "warn");
                throw ErrorEnum.UserPasswordError(userInfo.password);
            }

            let user
            if (identifier && identifier.includes('@')) {
                user = await prisma.superAdmin.findUnique({
                    where: { email: identifier },
                    select: {
                        id: true,
                        category: true,
                        email: true,
                        name: true,
                        password: true
                    },
                });

                if (!user) {
                    user = await prisma.superAdmin.findUnique({
                        where: { email: identifier },
                        select: {
                            id: true,
                            category: true,
                            email: true,
                            name: true,
                            password: true
                        },
                    });
                }
            } else {
                user = await prisma.superAdmin.findUnique({
                    where: { email: identifier },
                    select: {
                        id: true,
                        category: true,
                        email: true,
                        name: true,
                        password: true
                    },
                });
            }
            // let otpData

            // if (user && identifier) {
            //     otpData = {
            //         purpose: otpPurpose.LOGIN,
            //         identifier,
            //         deviceId,
            //         user: user.name
            //     };
            // }

            // const response = await sendOtpRequest(otpData as OtpRequestData);

            logWithMessageAndStep(childLogger, "Step 3", "OTP SUCCESSFULLY SENT", "login", JSON.stringify(user), "debug");

            const { accessToken, refreshToken } = generateTokens(user, true);

            user && res.status(201).json({
                data: {
                    name: user.name,
                    token: {
                        accessToken,
                        refreshToken
                    },
                    email: user.email,
                    category: user.category,
                }
            });
        } else {
            logWithMessageAndStep(childLogger, "Error Step", "User validation failed", "login", "User not found", "error");
            throw ErrorEnum.InternalserverError("Error validating User");
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during login process", "login", JSON.stringify(error), "error");
        return next(error);
    }
};
export const verifyLogin = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { otp, trxId, deviceId } = req.body;
    const user = req.user;

    try {
        if (user) {
            logWithMessageAndStep(childLogger, "Step 1", "Reading otp from Body", "verifyLogin", JSON.stringify(req.body), "info");

            const verifyOtpData = { otp, trxId, deviceId };

            logWithMessageAndStep(childLogger, "Step 2", "Verifying otp ", "verifyLogin", JSON.stringify(req.body), "info");

            //verifies login otp
            await verifyOtpRequest(verifyOtpData);

            const { accessToken, refreshToken } = generateTokens(user, true);

            logWithMessageAndStep(childLogger, "Step 3", "JWT token generated", "verifyLogin", JSON.stringify(user.email), "debug");

            res.cookie("refresh_token", refreshToken?.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            }).status(201).json(accessToken);
        } else {
            logWithMessageAndStep(childLogger, "Error Step", "User validation failed", "verifyLogin", "User not found", "error");
            throw ErrorEnum.InternalserverError("Error validating User");
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during verifyLogin process", "verifyLogin", JSON.stringify(error), "error");
        return next(error);
    }
};

export const refreshLoginToken = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const refreshToken = req?.cookies?.refresh_token;


    if (!refreshToken) {
        logWithMessageAndStep(childLogger, "Error Step", "Refresh token is missing", "refreshLoginToken", "", "error");
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Attempting to refresh access token", "refreshLoginToken", JSON.stringify({ refreshToken }), "info");

        // Refresh the access token using the provided refresh token
        const newAccessToken = refreshAccessToken(refreshToken);

        logWithMessageAndStep(childLogger, "Step 2", "Access token refreshed successfully", "refreshLoginToken", JSON.stringify(newAccessToken), "debug");

        return res.status(200).json({
            accessToken: newAccessToken.token,
            expiresIn: newAccessToken.expiresIn,
        });
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during access token refreshing process", "refreshLoginToken", JSON.stringify(error), "error");
        return next(error);
    }
};

export const sendOtp = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { deviceId, purpose } = req.body;
    const user = req.user

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Reading phone number and device ID from body", "sendOtp", JSON.stringify(req.body), "info");
        let otpData

        if (user) {
            otpData = {
                purpose,
                deviceId,
                user: user.name
            };
        }

        const response = await sendOtpRequest(otpData as OtpRequestData);

        logWithMessageAndStep(childLogger, "Step 2", "OTP sent successfully", "sendOtp", JSON.stringify(response), "debug");

        res.status(200).json(
            response,
        );
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during OTP sending process", "sendOtp", JSON.stringify(error), "error");

        return next(error)
    }
};
export const verifyOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { otp, trxId, deviceId } = req.body;

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Reading OTP, transaction ID, and device ID from body", "verifyOtp", JSON.stringify(req.body), "info");

        const verifyOtpData = {
            otp,
            trxId,
            deviceId,
        };

        const response = await verifyOtpRequest(verifyOtpData);

        logWithMessageAndStep(childLogger, "Step 2", "OTP verification successful", "verifyOtp", JSON.stringify(response), "debug");

        res.status(200).json(
            response,
        );
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during OTP verification process", "verifyOtp", JSON.stringify(error), "error");

        return next(error);
    }
};

export const resendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { trxId, deviceId } = req.body;

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Reading phone number, device ID, and purpose from body", "resendOtp", JSON.stringify(req.body), "info");

        const resendOtpData = {
            trxId,
            deviceId,
        };

        const response = await resendOtpRequest(resendOtpData);

        logWithMessageAndStep(childLogger, "Step 2", "OTP resend successful", "resendOtp", JSON.stringify(response), "debug");

        res.status(200).json(response);
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during OTP resend process", "resendOtp", JSON.stringify(error), "error");

        return next(error);
    }
};

export const resetPassword = async (
    req: RequestWithIdentifier,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const identifier = req.identifier
    const { email, deviceId } = req.body
    try {

        let otpData
        if (identifier) {
            otpData = {
                purpose: otpPurpose.RESET_PASSWORD,
                identifier,
                deviceId,
                user: email
            };
        }

        const response = await sendOtpRequest(otpData as OtpRequestData);

        res.status(200).json(response);

    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during password reset process", "resetPassword", JSON.stringify(error), "error");
        return next(error);
    }
}

export const verifyResetPassword = async (
    req: RequestWithIdentifier,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { otp, newPassword, confirmPassword, trxId, deviceId } = req.body;
    const identifier = req.identifier
    let user
    try {

        if (identifier && identifier.includes('@')) {
            user = await prisma.superAdmin.findUnique({
                where: { email: identifier },
                select: {
                    id: true,
                    category: true,
                    email: true,
                    name: true,
                    password: true
                },
            });

            if (!user) {
                user = await prisma.superAdmin.findUnique({
                    where: { email: identifier },
                    select: {
                        id: true,
                        category: true,
                        email: true,
                        name: true,
                        password: true
                    },
                });
            }
        } else {
            user = await prisma.superAdmin.findUnique({
                where: { email: identifier },
                select: {
                    id: true,
                    category: true,
                    email: true,
                    name: true,
                    password: true
                },
            });
        }
        if (!user) {
            logWithMessageAndStep(childLogger, "Error Step", "User validation failed", "resetPassword", "User not found", "error");
            throw ErrorEnum.UserNotFoundwithEmail(identifier);
        }

        logWithMessageAndStep(childLogger, "Step 1", "Reading OTP, new password, and confirm password from body", "resetPassword", JSON.stringify(req.body), "info");

        // Validate the reset password request body
        const validatedData = await ResetPasswordValidation.validateAsync({ otp, newPassword, confirmPassword, trxId, deviceId }, childLogger);

        logWithMessageAndStep(childLogger, "Step 5", "Validated reset password data", "resetPassword", JSON.stringify(validatedData), "info");

        // Verify OTP
        const verifyOtpData = { otp, trxId, deviceId };
        const verifyResponse = await verifyOtpRequest(verifyOtpData);

        logWithMessageAndStep(childLogger, "Step 6", "OTP verification result", "resetPassword", JSON.stringify(verifyResponse), "debug");

        if (!verifyResponse) {
            logWithMessageAndStep(childLogger, "Error Step", "OTP verification failed", "resetPassword", user.email, "warn");
            throw CommonError.OtpServerError();
        }

        // Hash new password
        const hashedPassword = await encryptPassword(newPassword, childLogger)
        logWithMessageAndStep(childLogger, "Step 7", "New password hashed", "resetPassword", JSON.stringify(hashedPassword), "debug");

        // Save new password to user record
        user.password = hashedPassword;
        await prisma.superAdmin.update({
            where: { email: user.email },
            data: {
                password: hashedPassword,
            }
        });

        logWithMessageAndStep(childLogger, "Step 5", "New password saved to user record", "resetPassword", user.email, "info");


        res.status(200).json({
            message: 'Password reset successful',
            data: {
                email: user.email,
                category: user.category,
            },
            statusCode: 200
        });

    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during password reset process", "resetPassword", JSON.stringify(error), "error");
        return next(error);
    }
}

export const updatePassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = req.user;

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Reading request body", "updatePassword", JSON.stringify(req.body), "info");

        // Validate the reset password request body
        if (user) {
            const { email, password } = user
            await UpdatePasswordValidation.validateAsync({ currentPassword, newPassword, confirmPassword, email }, childLogger);

            // Compare current password
            const isCurrentPasswordMatch = await bcrypt.compare(currentPassword, password);
            logWithMessageAndStep(childLogger, "Step 2", "Comparing current password", "updatePassword", JSON.stringify(isCurrentPasswordMatch), "debug");

            if (!isCurrentPasswordMatch) {
                logWithMessageAndStep(childLogger, "Error Step", "Current password mismatch", "updatePassword", email, "warn");
                throw ErrorEnum.UserPasswordError(email);
            }

            // Hash new password
            const hashedPassword = await encryptPassword(newPassword, childLogger);
            logWithMessageAndStep(childLogger, "Step 3", "New password hashed", "updatePassword", JSON.stringify(hashedPassword), "debug");

            // Save new password to user record
            await prisma.superAdmin.update({
                where: { email: email },
                data: { password: hashedPassword },
            });

            logWithMessageAndStep(childLogger, "Step 4", "New password saved to user record", "updatePassword", email, "info");

            // Generate new JWT token
            logWithMessageAndStep(childLogger, "Step 5", "JWT token generated", "updatePassword", JSON.stringify(email), "debug");

            res.status(200).json({
                name: user.name,
                email: user.email,
            });
        }

    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during password update process", "updatePassword", JSON.stringify(error), "error");
        return next(error);
    }
};





/*
/ Get profile 
*/


/**
 * Get user Profile 
 * @param email
 */
export const profile = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {

    try {
        const user = req.user

        if (user) {
            const { email } = user;
        
            // First attempt to find user in the 'users' table
            let userInfo = await prisma.superAdmin.findUnique({
                where: { email: email },
                select: {
                    id: true,
                    category: true,
                    email: true,
                },
            });
        
            // If no user found in 'users' table, search in 'wiwusers' table
            if (!userInfo) {
                userInfo = await prisma.samsarauser.findUnique({
                    where: { email: email },
                    select: {
                        id: true,
                        phoneNumber: true,
                        category: true,
                        address: true,
                        email: true,
                    },
                });
            }
        
            // If still no user info found, throw an error
            if (!userInfo) {
                throw ErrorEnum.UserNotFoundwithEmail(email);
            }
        
            // Return user info as response
            return res.status(200).json({
                message: "Profile Fetched Successfully",
                data: userInfo,
                statusCode: 200
            });
        }
        
        else {
            throw ErrorEnum.InternalserverError("Error validating User")
        }
    } catch (error) {
        return next(error)
    }
};

