import express, { Request, Response, NextFunction } from 'express';
import winston, { format} from 'winston';
import { statusCodes, logLevels } from "../../DataTypes/StatusCode/index.js";
import { ErrorObject, HTTPMethod, StatusCodeType } from "../../DataTypes/types/IUserType.js";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = format;

const logsFolder = path.join(new URL('../../', import.meta.url).pathname, 'logs');

// Define the custom interface extending Logform.TransformableInfo
interface CustomLogInfo {
    statusCode: number;
    timestamp: string;
    label?: string;
    endpoint?: string;
    step?: string;
    data?: any;
    method?: HTTPMethod;
}

const reqResFormat = printf((info: winston.Logform.TransformableInfo) => {
    // Cast info to include custom properties
    const { level, message, statusCode, timestamp, label, endpoint, method } = info as winston.Logform.TransformableInfo & CustomLogInfo;
    return `${level}: ${timestamp}:: ${statusCode} [${label}] :: ${endpoint} : ${method} :: ${message}`;
});

// Formatter for step logs
const logFormat = printf((info: winston.Logform.TransformableInfo) => {
    const { timestamp, step, method, data, message,level } = info as winston.Logform.TransformableInfo & CustomLogInfo;
    return `${level}:${timestamp}: ${step} : ${method} :: ${message}::${data} :: `;
});

// Function to get log level based on status code
function getLogLevel(statusCode: number): string | undefined {
    for (const [logLevel, codes] of Object.entries(logLevels)) {
        if (codes.includes(statusCode)) {
            return logLevel;
        }
    }

    return undefined;
}

// Function to create transports based on log level
function createTransportsBasedOnLogLevel(level: string): winston.transport[] {
    const transports: winston.transport[] = [
        // new winston.transports.File({ filename: path.join(logsFolder, `${level}.log`), level })
    ];


    if (level) {
        transports.push(new DailyRotateFile({
            filename: path.join(logsFolder, `request/%DATE%/${level}.log`),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: '1D', // Keep files for 1 day
            level
        }));
    }


    return transports;
}

// Create main logger
const logger = winston.createLogger({
    format: combine(
        timestamp(),
        reqResFormat
    ),
    transports: createTransportsBasedOnLogLevel('info') // Default to 'info' transport
});

// Function to create a child logger with additional metadata
const childLogger = winston.createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: createTransportsBasedOnLogLevel('debug')
});

function createChildLogger(): winston.Logger {

    return childLogger;
}


// Function to log with status code and message
export function logWithStatusCode(statusCode: number, endpoint?: string, method?: HTTPMethod, message?: ErrorObject | string, ): winston.Logger | null {
    let level = getLogLevel(statusCode);
    const messageString = JSON.stringify(message);
    level = level || 'info';
    const status = statusCodes[statusCode];
    const msg = status?.message || "Unknown Error Message";
    const label = status?.label;

    logger.configure({
        transports: createTransportsBasedOnLogLevel(level)
    });

    logger.log({
        level,
        label,
        message: message ? messageString : msg,
        endpoint,
        method,
        statusCode,
    });

    return createChildLogger();
}


// Function to log with a message and step using a child logger
export function logWithMessageAndStep(childLogger: winston.Logger, step: string, message: string, method: string, data: any,logLevel:string) {
    
    childLogger.configure({
        transports: createTransportsBasedOnLogLevel(logLevel)
    });

    childLogger.log({
        level: logLevel,
        step,
        message,
        method,
        timestamp: new Date().toISOString(),
        data
    });

    return createChildLogger();
}

// Middleware function to generate request IDs and log incoming requests and responses
export function loggerMiddleware(): express.RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const childLogger = logWithStatusCode(200, req.path, req.method as HTTPMethod, "New Request Sent");

        if (childLogger) {
            const originalJson = res.json.bind(res);
            res.json = function (data: ErrorObject) {
                return originalJson(data);
            };

            res.on("finish", () => {
                logWithStatusCode(res.statusCode as StatusCodeType, req.path, req.method as HTTPMethod, res.statusMessage);
            });

            // Attach child logger to the request object for use in API functions
            (req as any).childLogger = childLogger;
        } else {
            console.error('Failed to create child logger');
        }

        next();
    };
}