import express from "express";
import handleError from "../Middleware/handleError.js";
import { Request, Response, NextFunction } from "express";
import { DbError } from "../DataTypes/enums/Error.js";
import { isDatabaseHealthy } from "../Utils/db/client.js";
import AuthRoutes from "./Authentication/AuthRoutes.js"
import SuperAdmin from "./SystemAdmin/SystemAdminRoutes.js"
import TravelRoutes from "./Travel/TravelRoutes.js";
import LoginRoutes from "./Authentication/LoginRoutes.js";
import TraverInquiryRoutes from "./Travel/TraverInquiryRoutes.js";
import MeetingRoutes from "./MeetingBook/MeetingsRoutes.js";
import ExplorerRoute from './ExplorerRoute/index.js';
import RolesAndPermRoutes from './RolesAndPermissions/index.js';

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
//SuperAdmin routes
router.use(
  "/V1",
  CheckDatabaseConnection,
  SuperAdmin
);

//User routes
router.use(
  "/V1",
  CheckDatabaseConnection,
  LoginRoutes
);
//Travel inquiries routes
router.use(
  "/V1",
  CheckDatabaseConnection,
  TraverInquiryRoutes
);
/// meeting routes
router.use(
  "/V1",
  CheckDatabaseConnection,
  MeetingRoutes
);

router.use(
  "/V1",
  CheckDatabaseConnection,
  ExplorerRoute
);
router.use(
  "/V1",
  CheckDatabaseConnection,
  RolesAndPermRoutes
);

router.use(handleError)

export default router