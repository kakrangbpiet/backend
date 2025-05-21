import { Request, Response, NextFunction } from 'express';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import winston from 'winston';
import { UserCategory } from '../DataTypes/enums/IUserEnums.js';
import { IUser } from '../DataTypes/Interfaces/IUser.js';
import { logWithMessageAndStep } from '../Utils/Logger/logger.js';
import { RequestWithUser } from './checkJwt.js';
import { prisma } from '../Utils/db/client.js';
import { error } from 'console';

export default function IsOwnerOrAdmin() {
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

            // Get meeting ID from request params
            const meetingId = req.params.id;
            
            if (!meetingId) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "Meeting ID not provided", "IsOwnerOrAdmin", "", "warn");
                throw ErrorEnum.MissingMobile();
            }

            // Fetch only the phoneNumber from the meeting
            const meeting = await prisma.meeting.findUnique({
                where: { id: meetingId },
                select: {
                    phoneNumber: true
                }
            });

            if (!meeting) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "Meeting not found", "IsOwnerOrAdmin", meetingId, "warn");
                throw ErrorEnum.InternalserverError("Meeting Not found");
            }

            // Check if the user's phone number matches the meeting's phone number
            if (user.phoneNumber === meeting.phoneNumber) {
                logWithMessageAndStep(childLogger, "Middleware step", "User is owner, granting access", "IsOwnerOrAdmin", JSON.stringify({ 
                    userPhone: user.phoneNumber, 
                    meetingPhone: meeting.phoneNumber 
                }), "debug");
                return next();
            }

            // If neither admin nor owner
            logWithMessageAndStep(childLogger, "Error Middleware step", "User is neither owner nor admin", "IsOwnerOrAdmin", JSON.stringify({ 
                userPhone: user.phoneNumber, 
                meetingPhone: meeting.phoneNumber 
            }), "warn");
            throw ErrorEnum.InternalserverError(error);

        } catch (error) {
            next(error);
        }
    };
}