/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction, Request } from "express";
import winston from "winston";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
import { prisma } from "../../Utils/db/client.js";
import { otpPurpose } from "../../DataTypes/enums/IUserEnums.js";
import { ErrorEnum, DbError } from "../../DataTypes/enums/Error.js";
import { IUser } from "../../DataTypes/Interfaces/IUser.js";
import { PasswordLessUserValidation } from "../../Validation/UserValidation.js";
import { generateTokens, refreshAccessToken } from "../../Utils/scripts/jwtToken.js";
import { Prisma } from "@prisma/client";
import { twilioOtpService } from "../../externalApis/twilioOtpService.js";

/**
 * add new user
 * @param userModelValidation
 */
export const addUser = async (userModelValidation: IUser, childLogger: any) => {
    try {
        logWithMessageAndStep(childLogger, "Step 8", "Adding User via PrismaDB", "register", JSON.stringify(userModelValidation), "debug")

        const newUser = await prisma.$transaction(async (prisma) => {
            await prisma.unverifiedsamsarauser.deleteMany({
                where: { phoneNumber: userModelValidation.phoneNumber },
            });
            
            return await prisma.samsarauser.create({
                data: {
                    email: userModelValidation.email,
                    name: userModelValidation.name,
                    phoneNumber: userModelValidation.phoneNumber,
                    address: userModelValidation.address,
                    category: userModelValidation.category,
                    accountStatus: userModelValidation.accountStatus || "pending",
                }
            });
        });
        logWithMessageAndStep(childLogger, "Step 9", "User added to database", "register", JSON.stringify(newUser), "debug")

        return newUser;
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error step addUser", "Error while adding User in PrismaDB", "register", JSON.stringify(error), "error")
        console.error("Detailed Prisma error:", error);
        
        // Throw specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw ErrorEnum.SignUpValidationError("Duplicate entry - user already exists");
            }
        }
        throw DbError.ErrorOfPrisma(error);
    }
};


export const loginWithOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }

    const { phoneNumber,email, deviceId } = req.body;

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Initiating OTP login",
            "loginWithOtp",
            JSON.stringify(req.body),
            "info"
        );

        // Fetch user by phone number"
        let user
        user = await prisma.samsarauser.findUnique({
            where: { phoneNumber },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                category: true,
            },
        });
        if(!user){
            user = await prisma.superAdmin.findUnique({
                where: { phoneNumber },
                select: {
                    id: true,
                    email: true,
                    phoneNumber:true,
                    name: true,
                    category: true,
                },
            });
        }

        // If user is not found, save the user
        if (!user) {
            try {
                user = await prisma.unverifiedsamsarauser.findUnique({
                    where: { phoneNumber },
                    select: { id: true, phoneNumber: true },
                });
                if (!user) {
                    user = await prisma.unverifiedsamsarauser.create({
                        data: {
                            phoneNumber: phoneNumber,
                        }
                    });
                }
    
                logWithMessageAndStep(
                    childLogger,
                    "Step 2",
                    "User registered successfully",
                    "loginWithOtp",
                    JSON.stringify(user),
                    "info"
                );
            } catch (error) {
                logWithMessageAndStep(
                    childLogger,
                    "Error Step",
                    "Error while fetching user",
                    "loginWithOtp",
                    JSON.stringify(error),
                    "error"
                );
                throw DbError.ErrorOfPrisma(error);
            }
  
        }

        // Send OTP
        const otpData = {
            purpose: otpPurpose.LOGIN,
            phoneNumber,
            deviceId,
        };

        const otpResponse = await mockSendOtpRequest(otpData);

        logWithMessageAndStep(
            childLogger,
            "Step 3",
            "OTP sent successfully",
            "loginWithOtp",
            JSON.stringify(otpResponse),
            "info"
        );

        res.status(200).json({
            message: "OTP sent successfully",
            data: otpResponse,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error during OTP login",
            "loginWithOtp",
            JSON.stringify(error),
            "error"
        );
        return next(error);
    }
};

export const verifyOtpLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }

    const { otp, trxId, deviceId, phoneNumber } = req.body;

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Verifying OTP",
            "verifyOtpLogin",
            JSON.stringify(req.body),
            "info"
        );

        // Verify OTP
        const verifyOtpData = { otp, trxId, deviceId,phoneNumber };
        const otpVerified = await mockVerifyOtpRequest(verifyOtpData);

        if (!otpVerified) {
            logWithMessageAndStep(
                childLogger,
                "Error Step",
                "OTP verification failed",
                "verifyOtpLogin",
                JSON.stringify(verifyOtpData),
                "error"
            );
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Fetch user details from samsarauser
        let user
        user = await prisma.samsarauser.findUnique({
            where: { phoneNumber },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                category: true,
            },
        });
        if(user==null || undefined){
            user = await prisma.superAdmin.findUnique({
                where: { phoneNumber },
                select: {
                    id: true,
                    email: true,
                    phoneNumber:true,
                    name: true,
                    category: true,
                },
            });
        }
        // If not in samsarauser, check unverifiedsamsarauser
        if (!user) {
            const unverifiedUser = await prisma.unverifiedsamsarauser.findUnique({
                where: { phoneNumber },
                select: { id: true, phoneNumber: true },
            });

            if (unverifiedUser) {
                logWithMessageAndStep(
                    childLogger,
                    "Step 2",
                    "User is unverified",
                    "verifyOtpLogin",
                    JSON.stringify(unverifiedUser),
                    "info"
                );

                return res.status(200).json({
                    data: unverifiedUser,
                    message: "OTP verified successfully"
                });
            }

            logWithMessageAndStep(
                childLogger,
                "Error Step",
                "User not found after OTP verification",
                "verifyOtpLogin",
                phoneNumber,
                "error"
            );
            return res.status(404).json({ error: "User not found" });
        }

        // Generate JWT tokens for verified users
        const { accessToken, refreshToken } = await generateTokens(user, true);

        logWithMessageAndStep(
            childLogger,
            "Step 3",
            "JWT token generated",
            "verifyOtpLogin",
            JSON.stringify(user),
            "info"
        );

        // Set refresh token in cookies
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        // Send response
        res.status(200).json({
            data: {
                name: user.name,
                token: {
                    accessToken,
                    refreshToken,
                },
                email: user.email,
                phoneNumber: user.phoneNumber,
                category: user.category,
            },
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error during OTP verification",
            "verifyOtpLogin",
            JSON.stringify(error),
            "error"
        );
        return next(error);
    }
};

export const refreshLoginToken = async (
    req: Request,
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

const mockSendOtpRequest = async (otpData: any) => {
    // Simulate a delay for async behavior
    try {
        const { trxId } = await twilioOtpService.sendLoginOtp(otpData.phoneNumber);
        return {
            status: "success",
            trxId,
            message: "OTP sent successfully",
        };
    } catch (error) {
        console.error("OTP sending failed:", error);
        throw new Error("Failed to send OTP");
    }
};

const mockVerifyOtpRequest = async (verifyOtpData: any) => {
    // Simulate a delay for async behavior

    const isSuccess = await twilioOtpService.verifyLoginOtp(verifyOtpData.phoneNumber,verifyOtpData.otp );

    if (isSuccess) {
        return {
            status: "success",
            message: "OTP verified successfully",
        };
    } else {
        return null; // Simulate failure
    }
};

export const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }
    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Initiating user registration",
            "registerUser",
            JSON.stringify(req.body),
            "info"
        );

        // Validate user input
        const userModelValidation: IUser | undefined = await PasswordLessUserValidation.validateAsync(req.body, childLogger);

        if (!userModelValidation) {
            throw ErrorEnum.SignUpValidationError(JSON.stringify(req.body));
        }

        // Check if phone number is available
        const isPhoneNoAvailable = await prisma.samsarauser.findUnique({
            where: { phoneNumber: String(userModelValidation.phoneNumber) },
        });

        if (isPhoneNoAvailable) {
            throw ErrorEnum.SignUpValidationError(userModelValidation.phoneNumber);
        }
        
        
        const isVerifiedUser=await prisma.unverifiedsamsarauser.findUnique({
            where: { phoneNumber: userModelValidation.phoneNumber },
        });

        if (!isVerifiedUser) {
            throw ErrorEnum.SignUpValidationError(` ${userModelValidation.phoneNumber} not verified yet via otp`);
        }

        // Check if email is available
        const isEmailNoAvailable = await prisma.samsarauser.findUnique({
            where: { email: String(userModelValidation.email) },
        });

        if (isEmailNoAvailable) {
            throw ErrorEnum.SignUpValidationError(userModelValidation.email);
        }

        
        // Register the user
        const newUser = await addUser(userModelValidation, childLogger);
        await prisma.unverifiedsamsarauser.deleteMany({
            where: { phoneNumber: userModelValidation.phoneNumber },
        });

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            "User registered successfully",
            "registerUser",
            JSON.stringify(newUser),
            "info"
        );

        // Generate JWT tokens
        const { accessToken, refreshToken } = await generateTokens(newUser, true);

        logWithMessageAndStep(
            childLogger,
            "Step 3",
            "JWT token generated for registered user",
            "registerUser",
            JSON.stringify(newUser),
            "info"
        );

        // Set refresh token in cookies
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        // Send response
        res.status(201).json({
            data: {
                name: newUser.name,
                token: {
                    accessToken,
                    refreshToken,
                },
                email: newUser.email,
                category: newUser.category,
            },
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error during user registration",
            "registerUser",
            JSON.stringify(error),
            "error"
        );
        return next(error);
    }
};

/**
 * Get all users (both verified and unverified)
 */
export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Fetching all users",
            "getAllUsers",
            "",
            "info"
        );

        // Get verified users
        const verifiedUsers = await prisma.samsarauser.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                address: true,
                category: true,
                accountStatus: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get unverified users
        const unverifiedUsers = await prisma.unverifiedsamsarauser.findMany({
            select: {
                id: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            "Successfully fetched all users",
            "getAllUsers",
            JSON.stringify({
                verifiedCount: verifiedUsers.length,
                unverifiedCount: unverifiedUsers.length
            }),
            "info"
        );

        res.status(200).json({
            data: {
                verifiedUsers,
                unverifiedUsers
            },
            message: "Users fetched successfully"
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error while fetching users",
            "getAllUsers",
            JSON.stringify(error),
            "error"
        );
        
        return next(DbError.ErrorOfMongoose());
    }
};