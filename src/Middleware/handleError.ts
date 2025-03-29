import { Request, Response, NextFunction } from "express";
import { ErrorObject } from "../DataTypes/types/IUserType.js";
import { z } from "zod";

export const ErrorSchema = z.object({
  message: z.string(),
  // details: z.array(z.string()),
  details: z.any(),
  statusCode: z.number()
});

// All errors should be handled through this middleware
export default async function handleError(
  err: ErrorObject,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(err);
  
  const parsed = ErrorSchema.safeParse(err);
  if (parsed.success) {

    const details = parsed.data.details instanceof Error
      ? parsed.data.details.stack || parsed.data.details.message
      : parsed.data.details;

    // Check if details contains statusCode, message, and details
    if (details && details.statusCode && details.message && details.details) {
      return res.status(details.statusCode).json(details);
    } else {
      return res.status(err?.statusCode).json({
        statusCode: parsed.data.statusCode,
        message: parsed.data.message,
        details: details ? details.toString() : "No details available"
      });
    }
  }
  else {


    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      details: "Unknow Error Detected."
    });
  }
}