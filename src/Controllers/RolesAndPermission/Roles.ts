/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from "express";
import winston from "winston";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
import { prisma } from "../../Utils/db/client.js";
import { ErrorEnum, DbError } from "../../DataTypes/enums/Error.js";
import { RequestWithUser } from "../../Middleware/checkJwt.js"; // Assuming this exists
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";
import { Prisma } from "@prisma/client";
import { Permission, PermissionType } from "../../DataTypes/enums/IUserEnums.js"; // Assuming you defined Permission enum/const

/**
 * Controller to update a user's role (category).
 * Only Super Admins can perform this action.
 */
export const updateUserRole = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error: Logger not found."));
    }

    const { userId, newCategory } = req.body;

    if (!userId || !newCategory) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Missing userId or newCategory for role update",
            "updateUserRole",
            JSON.stringify(req.body),
            "warn"
        );
        return res.status(400).json({ error: "User ID and new category are required." });
    }

    // Basic validation for newCategory
    if (!Object.values(UserCategory).includes(newCategory)) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            `Invalid category provided: ${newCategory}`,
            "updateUserRole",
            JSON.stringify(req.body),
            "warn"
        );
        return res.status(400).json({ error: "Invalid user category provided." });
    }

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            `Attempting to update user role for userId: ${userId} to ${newCategory}`,
            "updateUserRole",
            JSON.stringify({ userId, newCategory }),
            "info"
        );

        let updatedUser;

        // Determine which table to update based on current category or preferred behavior
        // For simplicity, we'll try samsarauser first, then superAdmin
        updatedUser = await prisma.samsarauser.update({
            where: { id: userId },
            data: { category: newCategory, permissions: [] }, // <--- Added: Set permissions to an empty array
            select: { id: true, name: true, email: true, phoneNumber: true, category: true }
        }).catch(async (error) => {
            // If not found in samsarauser, try superAdmin
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                 return await prisma.superAdmin.update({
                    where: { id: userId },
                    data: { category: newCategory, permissions: [] }, // <--- Added: Set permissions to an empty array
                    select: { id: true, name: true, email: true, phoneNumber: true, category: true }
                });
            }
            throw error; // Re-throw other Prisma errors
        });


        logWithMessageAndStep(
            childLogger,
            "Step 2",
            `User role updated successfully for userId: ${userId}`,
            "updateUserRole",
            JSON.stringify(updatedUser),
            "info"
        );

        res.status(200).json({
            message: "User role and permissions updated successfully.", // Modified message
            data: updatedUser,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            `Error updating user role for userId: ${userId}`,
            "updateUserRole",
            JSON.stringify(error),
            "error"
        );
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "User not found." });
        }
        return next(DbError.ErrorOfPrisma(error));
    }
};

/**
 * Controller to assign specific permissions to a user.
 * Only Super Admins can perform this action.
 * Assumes a 'permissions' field of type String[] on user models.
 */
export const assignPermissionsToUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error: Logger not found."));
    }

    const { userId, permissionsToAdd } = req.body as { userId: string; permissionsToAdd: PermissionType[] };

    if (!userId || !Array.isArray(permissionsToAdd) || permissionsToAdd.length === 0) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Missing userId or permissionsToAdd for assigning permissions",
            "assignPermissionsToUser",
            JSON.stringify(req.body),
            "warn"
        );
        return res.status(400).json({ error: "User ID and an array of permissions to add are required." });
    }

    // Validate if provided permissions are known
    const invalidPermissions = permissionsToAdd.filter(p => !Object.values(Permission).includes(p));
    if (invalidPermissions.length > 0) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            `Invalid permissions provided: ${invalidPermissions.join(', ')}`,
            "assignPermissionsToUser",
            JSON.stringify(req.body),
            "warn"
        );
        return res.status(400).json({ error: `Invalid permissions: ${invalidPermissions.join(', ')}` });
    }

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            `Attempting to assign permissions to userId: ${userId}`,
            "assignPermissionsToUser",
            JSON.stringify({ userId, permissionsToAdd }),
            "info"
        );

        let updatedUser;

        // Fetch current permissions to avoid duplicates
        let user: { permissions: string[] | null } | null;
        user = await prisma.samsarauser.findUnique({ where: { id: userId }, select: { permissions: true } });
        if (!user) {
            user = await prisma.superAdmin.findUnique({ where: { id: userId }, select: { permissions: true } });
        }

        if (!user) {
            logWithMessageAndStep(
                childLogger,
                "Error Step",
                `User not found for assigning permissions: ${userId}`,
                "assignPermissionsToUser",
                "",
                "warn"
            );
            return res.status(404).json({ error: "User not found." });
        }

        const currentPermissions = user.permissions || [];
        const uniqueNewPermissions = [...new Set([...currentPermissions, ...permissionsToAdd])];

        // Update permissions for samsarauser or superAdmin
        updatedUser = await prisma.samsarauser.update({
            where: { id: userId },
            data: { permissions: uniqueNewPermissions },
            select: { id: true, name: true, email: true, phoneNumber: true, category: true, permissions: true }
        }).catch(async (error) => {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                 return await prisma.superAdmin.update({
                    where: { id: userId },
                    data: { permissions: uniqueNewPermissions },
                    select: { id: true, name: true, email: true, phoneNumber: true, category: true, permissions: true }
                });
            }
            throw error;
        });

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            `Permissions assigned successfully for userId: ${userId}`,
            "assignPermissionsToUser",
            JSON.stringify(updatedUser),
            "info"
        );

        res.status(200).json({
            message: "Permissions assigned successfully.",
            data: updatedUser,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            `Error assigning permissions to userId: ${userId}`,
            "assignPermissionsToUser",
            JSON.stringify(error),
            "error"
        );
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "User not found." });
        }
        return next(DbError.ErrorOfPrisma(error));
    }
};

/**
 * Controller to revoke specific permissions from a user.
 * Only Super Admins can perform this action.
 * Assumes a 'permissions' field of type String[] on user models.
 */
export const revokePermissionsFromUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error: Logger not found."));
    }

    const { userId, permissionsToRemove } = req.body as { userId: string; permissionsToRemove: PermissionType[] };

    if (!userId || !Array.isArray(permissionsToRemove) || permissionsToRemove.length === 0) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Missing userId or permissionsToRemove for revoking permissions",
            "revokePermissionsFromUser",
            JSON.stringify(req.body),
            "warn"
        );
        return res.status(400).json({ error: "User ID and an array of permissions to remove are required." });
    }

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            `Attempting to revoke permissions from userId: ${userId}`,
            "revokePermissionsFromUser",
            JSON.stringify({ userId, permissionsToRemove }),
            "info"
        );

        let updatedUser;

        // Fetch current permissions
        let user: { permissions: string[] | null } | null;
        user = await prisma.samsarauser.findUnique({ where: { id: userId }, select: { permissions: true } });
        if (!user) {
            user = await prisma.superAdmin.findUnique({ where: { id: userId }, select: { permissions: true } });
        }

        if (!user) {
            logWithMessageAndStep(
                childLogger,
                "Error Step",
                `User not found for revoking permissions: ${userId}`,
                "revokePermissionsFromUser",
                "",
                "warn"
            );
            return res.status(404).json({ error: "User not found." });
        }

        const currentPermissions = user.permissions || [];
        const remainingPermissions = currentPermissions.filter(p => !permissionsToRemove.includes(p as PermissionType));

        // Update permissions for samsarauser or superAdmin
        updatedUser = await prisma.samsarauser.update({
            where: { id: userId },
            data: { permissions: remainingPermissions },
            select: { id: true, name: true, email: true, phoneNumber: true, category: true, permissions: true }
        }).catch(async (error) => {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                 return await prisma.superAdmin.update({
                    where: { id: userId },
                    data: { permissions: remainingPermissions },
                    select: { id: true, name: true, email: true, phoneNumber: true, category: true, permissions: true }
                });
            }
            throw error;
        });

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            `Permissions revoked successfully for userId: ${userId}`,
            "revokePermissionsFromUser",
            JSON.stringify(updatedUser),
            "info"
        );

        res.status(200).json({
            message: "Permissions revoked successfully.",
            data: updatedUser,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            `Error revoking permissions from userId: ${userId}`,
            "revokePermissionsFromUser",
            JSON.stringify(error),
            "error"
        );
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "User not found." });
        }
        return next(DbError.ErrorOfPrisma(error));
    }
};

/**
 * Controller to get a user's assigned permissions.
 * Any authenticated user can check their own permissions, or an Admin/SuperAdmin can check others.
 */
export const getPermissionsForUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error: Logger not found."));
    }

    const targetUserId = req.params.id; // User ID from URL parameter
    const requestingUserId = req.user?.id; // Authenticated user's ID

    if (!targetUserId) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Missing userId in request params",
            "getPermissionsForUser",
            "",
            "warn"
        );
        return res.status(400).json({ error: "User ID is required." });
    }

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            `Attempting to fetch permissions for userId: ${targetUserId} by ${requestingUserId}`,
            "getPermissionsForUser",
            "",
            "info"
        );

        let userPermissions: string[] = [];
        let userCategory: UserCategory | undefined;

        // Fetch user permissions from samsarauser or superAdmin
        let userRecord: { permissions: string[] | null, category: UserCategory } | null;
        const samsaraUser = await prisma.samsarauser.findUnique({
            where: { id: targetUserId },
            select: { permissions: true, category: true }
        });

        if (samsaraUser) {
            userRecord = {
                permissions: samsaraUser.permissions,
                category: samsaraUser.category as UserCategory
            };
        } else {
            const superAdminUser = await prisma.superAdmin.findUnique({
                where: { id: targetUserId },
                select: { permissions: true, category: true }
            });
            if (superAdminUser) {
                userRecord = {
                    permissions: superAdminUser.permissions,
                    category: superAdminUser.category as UserCategory
                };
            } else {
                userRecord = null;
            }
        }

        if (userRecord) {
            userPermissions = userRecord.permissions || [];
            userCategory = userRecord.category;
        } else {
            logWithMessageAndStep(
                childLogger,
                "Error Step",
                `User not found for fetching permissions: ${targetUserId}`,
                "getPermissionsForUser",
                "",
                "warn"
            );
            return res.status(404).json({ error: "User not found." });
        }

        // Authorization check: A user can see their own permissions.
        // Super Admins can see anyone's permissions.
        // Admins might be restricted or allowed based on policy.
        if (requestingUserId !== targetUserId && req.user?.category !== UserCategory.SUPER_ADMIN) {
             // You might add checks for other admin roles here if they have permission to view others' roles/permissions
            logWithMessageAndStep(
                childLogger,
                "Authorization Error",
                `Unauthorized attempt to view permissions for userId: ${targetUserId} by ${requestingUserId}`,
                "getPermissionsForUser",
                "",
                "warn"
            );
            return res.status(403).json({ error: "Forbidden: You do not have permission to view this user's permissions." });
        }


        logWithMessageAndStep(
            childLogger,
            "Step 2",
            `Permissions fetched successfully for userId: ${targetUserId}`,
            "getPermissionsForUser",
            JSON.stringify(userPermissions),
            "info"
        );

        res.status(200).json({
            message: "User permissions fetched successfully.",
            data: {
                userId: targetUserId,
                category: userCategory,
                permissions: userPermissions,
            },
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            `Error fetching permissions for userId: ${targetUserId}`,
            "getPermissionsForUser",
            JSON.stringify(error),
            "error"
        );
        return next(DbError.ErrorOfPrisma(error));
    }
};

/**
 * Controller to get all available roles.
 * Accessible to Super Admins.
 */
export const getAllRoles = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error: Logger not found."));
    }

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Fetching all available roles", "getAllRoles", "", "info");
        const roles = Object.values(UserCategory);
        logWithMessageAndStep(childLogger, "Step 2", "All roles fetched successfully", "getAllRoles", JSON.stringify(roles), "info");
        res.status(200).json({
            message: "All available roles fetched successfully.",
            data: roles,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error fetching all roles",
            "getAllRoles",
            JSON.stringify(error),
            "error"
        );
        return next(error); // This should ideally not happen unless there's an issue with `Object.values` or `UserCategory`
    }
};

/**
 * Controller to get all available permissions.
 * Accessible to Super Admins.
 */
export const getAllPermissions = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error: Logger not found."));
    }

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Fetching all available permissions", "getAllPermissions", "", "info");
        const permissions = Object.values(Permission);
        logWithMessageAndStep(childLogger, "Step 2", "All permissions fetched successfully", "getAllPermissions", JSON.stringify(permissions), "info");
        res.status(200).json({
            message: "All available permissions fetched successfully.",
            data: permissions,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error fetching all permissions",
            "getAllPermissions",
            JSON.stringify(error),
            "error"
        );
        return next(error);
    }
};