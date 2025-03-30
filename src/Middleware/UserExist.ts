import { Response, NextFunction, Request } from 'express';
import { CommonError, ErrorEnum } from '../DataTypes/enums/Error.js';
import winston from 'winston';
import { IsystemAdmin, IUser } from '../DataTypes/Interfaces/IUser.js';
import { prisma } from 'src/Utils/db/client.js';
import { logWithMessageAndStep } from 'src/Utils/Logger/logger.js';

{/*
  // Should be used only while login or when one user want to interact with other user
 // should be used only with req.body
  */}
export interface LoginUserRequest extends Request {
  user?: IUser | IsystemAdmin;
  identifier?: string; 
  body:any;
  method:any;
  cookies:any;
  query:any;
}

export const checkUserExists = async (
  req: LoginUserRequest,
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
    logWithMessageAndStep(childLogger, "Check User Step 1", `Check if ${identifierType} is provided`, "checkUserExists", JSON.stringify({ identifier }), "silly");

    if (!identifier && identifierType === 'email') {
      logWithMessageAndStep(childLogger, "Error Check User Step", `Missing ${identifierType} in request`, "checkUserExists", {}, "warn");
      throw ErrorEnum.MissingEmail();
    }

    if (!identifier && identifierType === 'phoneNumber') {
      logWithMessageAndStep(childLogger, "Error Check User Step", `Missing ${identifierType} in request`, "checkUserExists", {}, "warn");
      throw CommonError.MissingPhoneNumber();
    }

    logWithMessageAndStep(childLogger, "Check User Step 2", `Searching for user in db`, "checkUserExists", JSON.stringify({ identifier }), "silly");

    // Search for the user in the users collection only
    let user;
    if (identifierType === 'email') {
      user = await prisma.samsarauser.findUnique({
        where: { email: identifier }
      });
      if(!user){
        user = await prisma.superAdmin.findUnique({
          where: { email: identifier }
        });
      }
    } else if (identifierType === 'phoneNumber') {
      user = await prisma.samsarauser.findUnique({
        where: { phoneNumber: identifier }
      });
    }

    logWithMessageAndStep(childLogger, "Check User Step 3", "Check if user exists in the database", "checkUserExists", JSON.stringify({ user }), "debug");

    if (!user && identifierType === 'email') {
      logWithMessageAndStep(childLogger, "Error Check User Step", `User not found with ${identifierType}: ${identifier}`, "checkUserExists", JSON.stringify({ identifier }), "error");
      throw ErrorEnum.UserNotFoundwithEmail(identifier);
    }

    if (!user && identifierType === 'phoneNumber') {
      logWithMessageAndStep(childLogger, "Error Check User Step", `User not found with ${identifierType}: ${identifier}`, "checkUserExists", JSON.stringify({ identifier }), "error");
      throw ErrorEnum.UserNotFoundwithPhone(identifier);
    }

    req.user = user  as IUser | IsystemAdmin;
    req.identifier = identifier;

    logWithMessageAndStep(childLogger, "Check User Step 4", "User found and added to request", "checkUserExists", JSON.stringify({ user: req.user }), "debug");

    next();
  } catch (error) {
    logWithMessageAndStep(childLogger, "Error Check User Step", "Error occurred while checking user", "checkUserExists", JSON.stringify({ error }), "error");
    next(error);
  }
};