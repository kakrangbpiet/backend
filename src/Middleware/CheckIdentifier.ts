import { Response, NextFunction, Request } from 'express';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import winston from 'winston';
import { logWithMessageAndStep } from '../Utils/Logger/logger.js';

 export interface RequestWithIdentifier extends Request {
     identifier?: string;
     body: any;
     method: any;
     query: any;
}

export const checkIdentifier = async (
    req: RequestWithIdentifier,
    res: Response,
    next: NextFunction,
    identifierType: 'email' | 'phoneNumber'
) => {
    let identifier: string | undefined;

    if (req.method === 'GET') {
        identifier = req.query[identifierType] as string;
    } else if (req.method === 'POST' || req.method === 'PATCH') {
        identifier = req.body[identifierType];
    }

    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    try {
        if (!identifier) {
            logWithMessageAndStep(childLogger, "Error Validate Identifier Step", `Missing ${identifierType} in request`, "ValidateIdentifier", {}, "warn");
            throw identifierType === 'email' ? ErrorEnum.MissingEmail() : ErrorEnum.MissingMobile();
        }

        logWithMessageAndStep(childLogger, "Validate Identifier Step 2", `${identifierType} validated and added to request`, "ValidateIdentifier", { identifier }, "debug");

        req.identifier = identifier;

        logWithMessageAndStep(childLogger, "Validate Identifier Step 3", `${identifierType} successfully added to request`, "ValidateIdentifier", { identifier }, "debug");

        next();
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Validate Identifier Step", `Error occurred while validating ${identifierType}`, "ValidateIdentifier", { error: JSON.stringify(error) }, "error");
        next(error);
    }
};