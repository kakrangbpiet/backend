import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import config from '../config.js';
import winston from 'winston';
import { UserCategory } from '../DataTypes/enums/IUserEnums.js';
import { IUser } from '../DataTypes/Interfaces/IUser.js';
import { logWithMessageAndStep } from '../Utils/Logger/logger.js';

const JWT_SECRET = config.JWT_SECRET;

export interface RequestWithUser extends Request {
    user?: IUser;
    email?: string;
    headers: any;
    params: any;
    body: any;
    file?: any;
}

export default function checkJwt(
    allowedCategories: UserCategory[] 
) {
    return async (req: RequestWithUser, _res: Response, next: NextFunction) => {
        const childLogger = (req as any).childLogger as winston.Logger;

        if (!childLogger) {
            console.error('Child Logger not found on request object');
            return next(new Error('Internal Server Error'));
        }

        try {
            const authHeader = req.headers.authorization;
            logWithMessageAndStep(childLogger, "Middleware step 1", "Checking if auth header is present", "checkJwt", JSON.stringify(authHeader), "silly");

            if (!authHeader) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "AuthHeader not present", "checkJwt", JSON.stringify(authHeader), "warn");
                throw ErrorEnum.MissingAuth();
            }

            const token = authHeader.split(' ')[1];
            logWithMessageAndStep(childLogger, "Middleware step 2", "Checking if auth header contains token", "checkJwt", JSON.stringify(token), "silly");

            if (!token) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "Token not present", "checkJwt", JSON.stringify(token), "warn");
                throw ErrorEnum.MissingJwt();
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET as string) as  IUser 
                logWithMessageAndStep(childLogger, "Middleware step 3", "Decoded Token", "checkJwt", JSON.stringify(decoded), "debug");

                if (decoded) {
                    req.user = decoded;

                    // Check if the category matches one of the allowed categories
                    if (allowedCategories.length && !allowedCategories.includes(decoded.category)) {
                        logWithMessageAndStep(childLogger, "Error Middleware step", "Unauthorized - Category mismatch", "checkJwt", JSON.stringify(decoded.category), "warn");
                        return next(ErrorEnum.Unauthorized());
                    }
                }

                next();
            } catch (err) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "Error decoding token", "checkJwt", JSON.stringify(err), "error");
                throw ErrorEnum.InvalidJwt(err);
            }
        } catch (error) {
            next(error);
        }
    };
}