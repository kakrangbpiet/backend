import express from "express";
import handleError from "../Middleware/handleError.js";
import { Request, Response, NextFunction } from "express";
import { DbError } from "../DataTypes/enums/Error.js";
import { isDatabaseHealthy } from "../Utils/db/client.js";
import AuthRoutes from "./Authentication/AuthRoutes.js"
import TravelRoutes from "./Travel/TravelRoutes.js";
const router = express.Router({ mergeParams: true });

// Middleware to check Mongoose connection
const CheckDatabaseConnection = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const isDatabseHealthy = await isDatabaseHealthy()
    if (isDatabseHealthy == false) {
      // Prisma is not connected
      throw DbError.DatabaseConnectionError();
    }
    next();
  } catch (error) {
    return next(error);
  }
};

// Define GET API
router.get("/health", CheckDatabaseConnection, async (_req: Request, res: Response) => {
    res.status(200).json({ message: "Database is healthy", status: "OK" });
  });

//system Admin Routes
router.use(
  "/V1",
  CheckDatabaseConnection,
  AuthRoutes
);

//travel routes
router.use(
  "/V1",
  CheckDatabaseConnection,
  TravelRoutes
);

router.use(handleError)

export default router