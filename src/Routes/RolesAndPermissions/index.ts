import express from "express";
import {
    updateUserRole,
    assignPermissionsToUser,
    revokePermissionsFromUser,
    getPermissionsForUser,
    getAllRoles,
    getAllPermissions,
} from "../../Controllers/RolesAndPermission/Roles.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router();



/**
 * @swagger
 * /admin/users/role:
 * patch:
 * summary: Update a user's category (role)
 * tags: [Roles & Permissions]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - userId
 * - newCategory
 * properties:
 * userId:
 * type: string
 * description: The ID of the user to update.
 * example: "clxf314b90000abcde12345"
 * newCategory:
 * type: string
 * enum: [super_admin, admin, customer, vendor] # Update with your actual UserCategory enums
 * description: The new category (role) for the user.
 * example: "admin"
 * responses:
 * 200:
 * description: User role updated successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: "User role updated successfully."
 * data:
 * type: object
 * properties:
 * id: { type: string }
 * name: { type: string }
 * email: { type: string }
 * phoneNumber: { type: string }
 * category: { type: string }
 * 400:
 * description: Bad request (missing userId or newCategory, or invalid category).
 * 401:
 * description: Unauthorized (authentication required).
 * 403:
 * description: Forbidden (insufficient permissions, only SUPER_ADMIN allowed).
 * 404:
 * description: User not found.
 * 500:
 * description: Internal server error.
 */
router.patch(
    "/admin/users/role",
    checkJwt([UserCategory.SUPER_ADMIN]), // Only Super Admins can update roles
    updateUserRole
);

/**
 * @swagger
 * /admin/users/permissions/assign:
 * patch:
 * summary: Assign specific permissions to a user
 * tags: [Roles & Permissions]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - userId
 * - permissionsToAdd
 * properties:
 * userId:
 * type: string
 * description: The ID of the user to assign permissions to.
 * example: "clxf314b90000abcde12345"
 * permissionsToAdd:
 * type: array
 * items:
 * type: string
 * enum: [manage_users, create_travel_package, update_travel_package, delete_travel_package, view_travel_packages, manage_roles, assign_permissions] # Update with your actual Permission enums
 * description: An array of permission strings to add to the user.
 * example: ["create_travel_package", "update_travel_package"]
 * responses:
 * 200:
 * description: Permissions assigned successfully.
 * 400:
 * description: Bad request (missing userId or permissionsToAdd, or invalid permissions).
 * 401:
 * description: Unauthorized.
 * 403:
 * description: Forbidden (only SUPER_ADMIN allowed).
 * 404:
 * description: User not found.
 * 500:
 * description: Internal server error.
 */
router.patch(
    "/admin/users/permissions/assign",
    checkJwt([UserCategory.SUPER_ADMIN]), // Only Super Admins can assign permissions
    assignPermissionsToUser
);

/**
 * @swagger
 * /admin/users/permissions/revoke:
 * patch:
 * summary: Revoke specific permissions from a user
 * tags: [Roles & Permissions]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - userId
 * - permissionsToRemove
 * properties:
 * userId:
 * type: string
 * description: The ID of the user to revoke permissions from.
 * example: "clxf314b90000abcde12345"
 * permissionsToRemove:
 * type: array
 * items:
 * type: string
 * enum: [manage_users, create_travel_package, update_travel_package, delete_travel_package, view_travel_packages, manage_roles, assign_permissions] # Update with your actual Permission enums
 * description: An array of permission strings to remove from the user.
 * example: ["view_travel_packages"]
 * responses:
 * 200:
 * description: Permissions revoked successfully.
 * 400:
 * description: Bad request.
 * 401:
 * description: Unauthorized.
 * 403:
 * description: Forbidden (only SUPER_ADMIN allowed).
 * 404:
 * description: User not found.
 * 500:
 * description: Internal server error.
 */
router.patch(
    "/admin/users/permissions/revoke",
    checkJwt([UserCategory.SUPER_ADMIN]), // Only Super Admins can revoke permissions
    revokePermissionsFromUser
);

/**
 * @swagger
 * /users/permissions/{id}:
 * get:
 * summary: Get a user's assigned permissions
 * tags: [Roles & Permissions]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the user to retrieve permissions for.
 * example: "clxf314b90000abcde12345"
 * responses:
 * 200:
 * description: User permissions fetched successfully.
 * 400:
 * description: Bad request (missing userId).
 * 401:
 * description: Unauthorized.
 * 403:
 * description: Forbidden (not authorized to view another user's permissions unless super admin).
 * 404:
 * description: User not found.
 * 500:
 * description: Internal server error.
 */
router.get(
    "/users/permissions/:id",
    checkJwt([UserCategory.SUPER_ADMIN, UserCategory.SAMSARA_MARKETING, UserCategory.SAMSARA_OPERATION, UserCategory.User]), // Adjust who can view permissions (e.g., any authenticated user for their own, or admins for others)
    getPermissionsForUser
);

/**
 * @swagger
 * /admin/roles:
 * get:
 * summary: Get all available user roles
 * tags: [Roles & Permissions]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: All available roles fetched successfully.
 * 401:
 * description: Unauthorized.
 * 403:
 * description: Forbidden (only SUPER_ADMIN allowed).
 * 500:
 * description: Internal server error.
 */
router.get(
    "/admin/roles",
    checkJwt([UserCategory.SUPER_ADMIN]), // Only Super Admins can view all roles
    getAllRoles
);

/**
 * @swagger
 * /admin/permissions:
 * get:
 * summary: Get all available system permissions
 * tags: [Roles & Permissions]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: All available permissions fetched successfully.
 * 401:
 * description: Unauthorized.
 * 403:
 * description: Forbidden (only SUPER_ADMIN allowed).
 * 500:
 * description: Internal server error.
 */
router.get(
    "/admin/permissions",
    checkJwt([UserCategory.SUPER_ADMIN]), // Only Super Admins can view all permissions
    getAllPermissions
);

export default router;