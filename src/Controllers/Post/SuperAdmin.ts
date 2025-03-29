/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { ErrorEnum, SuperAdminError } from "../../DataTypes/enums/Error.js";
import { SystemAdminValidation } from "../../Validation/UserValidation.js";

import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";
import winston from "winston";
// import { CreatePermissionControl, DeletePermissionControl, ReadPermissionControl, UpdatePermissionControl } from "../../DataTypes/rbac/permission.js";
import { IsystemAdmin } from "../../DataTypes/Interfaces/IUser.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
import { prisma } from "../../Utils/db/client.js";

/**
 * Create Super Admin
 * @param email
 * @param password
 * @param name
 */

export const Create_superAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Reading FormData via Body", "Create_superAdmin", JSON.stringify(req.body.email), "info");

        const systemAdminValidation: IsystemAdmin | undefined = await SystemAdminValidation.validateAsync(
            req.body,
            childLogger
        );

        if (!systemAdminValidation || systemAdminValidation == undefined) {
            throw ErrorEnum.SignUpValidationError(JSON.stringify(req.body))
        }
        // const existingAdmin = await prisma.superAdmin.findUnique({
        //     where: { category: UserCategory.SUPER_ADMIN },
        // })
        // logWithMessageAndStep(childLogger, "Step 5", "Checkng if admin Already Exist or not", "Create_superAdmin", JSON.stringify(!existingAdmin), "info");
        // if (existingAdmin) {
        //     logWithMessageAndStep(childLogger, "Error Step", "Super admin Alread Exist", "Create_superAdmin", JSON.stringify(!existingAdmin), "warn");
        //     throw SuperAdminError.SuperAdminInitError()
        // }
        // Create a new System Admin


        // const allPermissions = [
        //     // ...Object.values(RoleBasedControl),
        //     ...Object.values(CreatePermissionControl),
        //     ...Object.values(ReadPermissionControl),
        //     ...Object.values(UpdatePermissionControl),
        //     ...Object.values(DeletePermissionControl),
        // ];
        const newUser = await prisma.superAdmin.create({
            data: {
                email: systemAdminValidation.email,
                name: systemAdminValidation.name,
                password: systemAdminValidation.password,
                category: systemAdminValidation.category || UserCategory.SUPER_ADMIN,
                // permissions: allPermissions
            },
        });
        logWithMessageAndStep(childLogger, "Step 6", "New user created via prismaDB", "Create_superAdmin", JSON.stringify(newUser), "debug");

        if (newUser) {
            res.status(201).json({
                message: "Super Admin Initialised SuccessFully",
                data: newUser,
                statusCode: 200
            });
        } else {
            logWithMessageAndStep(childLogger, "Error Step", "Error Connecting to DB", "Create_superAdmin", "", "info");
            throw SuperAdminError.ErrorCreatingUser()
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error While Setting SuperAdmin", "Create_superAdmin", JSON.stringify(error), "error");
        return next(error)
    }
};



