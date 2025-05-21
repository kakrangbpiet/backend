import { Request, Response, NextFunction } from 'express';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import winston from 'winston';
import { UserCategory } from '../DataTypes/enums/IUserEnums.js';
import { IUser } from '../DataTypes/Interfaces/IUser.js';
import { logWithMessageAndStep } from '../Utils/Logger/logger.js';
import { RequestWithUser } from './checkJwt.js';
import { prisma } from '../Utils/db/client.js';
import { error } from 'console';

export default function IsOwnerOrAdminTravelinquiry() {
    return async (req: RequestWithUser, _res: Response, next: NextFunction) => {
        const childLogger = (req as any).childLogger as winston.Logger;

        if (!childLogger) {
            console.error('Child Logger not found on request object');
            return next(new Error('Internal Server Error'));
        }

        try {
            // Get the user from the request (set by checkJwt middleware)
            const user = req.user;
            
            if (!user) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "User not found in request", "IsOwnerOrAdmin", "", "warn");
                throw ErrorEnum.Unauthorized();
            }

            // Check if user is admin (SUPER_ADMIN)
            if (user.category === UserCategory.SUPER_ADMIN) {
                logWithMessageAndStep(childLogger, "Middleware step", "User is admin, granting access", "IsOwnerOrAdmin", JSON.stringify(user), "debug");
                return next();
            }

            // Get Travelinquiry ID from request params
            const inquiryId = req.params.id;
            
            if (!inquiryId) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "Travelinquiry ID not provided", "IsOwnerOrAdmin", "", "warn");
                throw ErrorEnum.MissingMobile();
            }

            // Fetch only the phoneNumber from the Travelinquiry
            const inquiry = await prisma.travelInquiry.findUnique({
                where: { id: inquiryId },
                select: {
                    phoneNumber: true
                }
            });

            if (!inquiry) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "Travelinquiry not found", "IsOwnerOrAdmin", inquiryId, "warn");
                throw ErrorEnum.InternalserverError("Travelinquiry Not found");
            }

            // Check if the user's phone number matches the Travelinquiry's phone number
            if (user.phoneNumber === inquiry.phoneNumber) {
                logWithMessageAndStep(childLogger, "Middleware step", "User is owner, granting access", "IsOwnerOrAdmin", JSON.stringify({ 
                    userPhone: user.phoneNumber, 
                    TravelinquiryPhone: inquiry.phoneNumber 
                }), "debug");
                return next();
            }

            // If neither admin nor owner
            logWithMessageAndStep(childLogger, "Error Middleware step", "User is neither owner nor admin", "IsOwnerOrAdmin", JSON.stringify({ 
                userPhone: user.phoneNumber, 
                TravelinquiryPhone: inquiry.phoneNumber 
            }), "warn");
            throw ErrorEnum.InternalserverError(error);

        } catch (error) {
            next(error);
        }
    };
}