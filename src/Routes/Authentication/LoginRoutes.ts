import express from "express";
import { checkUserExists } from "../../Middleware/UserExist.js";
import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";
import checkJwt from "../../Middleware/checkJwt.js";
import * as CommonController from "../../Controllers/Post/Login.js";
// import { checkIdentifier } from "../../Middleware/CheckIdentifier.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/login",
    (req, res, next) => {
        const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
        checkUserExists(req, res, next, identifierType);
    },
    checkUserCategoryExists,
    CommonController.login);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: 
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/profile",
    checkJwt([UserCategory.User,UserCategory.SUPER_ADMIN]),
    // (req, res, next) => {
    //     const identifierType = req.query.phoneNumber ? 'phoneNumber' : 'email';
    //     ValidateApiKey(req, res, next, identifierType);
    // },
    checkUserCategoryExists,
    // CheckPermission(ReadPermissionControl.can_read_profile),
    CommonController.profile);

/**
 * @swagger
 * /refreshLoginToken:
 *   post:
 *     summary: Refresh login token
 *     tags: 
 *       - Common
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/refreshLoginToken",
    CommonController.refreshLoginToken);

/**
 * @swagger
 * /sendOtp:
 *   post:
 *     summary: Send OTP
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "1234-5678-9012"
 *               purpose:
 *                 type: string
 *                 example: "login"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/sendOtp", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkUserExists(req, res, next, identifierType);
}, CommonController.sendOtp);

/**
 * @swagger
 * /verifyOtp:
 *   post:
 *     summary: Verify OTP
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "1234567890"
 *               trxId:
 *                 type: string
 *                 example: ""
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/verifyOtp", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkUserExists(req, res, next, identifierType);
}, CommonController.verifyOtp);

/**
 * @swagger
 * /resendOtp:
 *   post:
 *     summary: Resend OTP
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "1234567890"
 *               trxId:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/resendOtp", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkUserExists(req, res, next, identifierType);
}, CommonController.resendOtp);

/**
 * @swagger
 * /resetPassword:
 *   post:
 *     summary: Reset user password
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
// router.post("/resetPassword", (req, res, next) => {
//     const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
//     checkIdentifier(req, res, next, identifierType);
// }, CommonController.resetPassword);

/**
 * @swagger
 * /verifyResetPassword:
 *   patch:
 *     summary: Verify reset password
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset verified successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
// router.patch("/verifyResetPassword", (req, res, next) => {
//     const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
//     checkIdentifier(req, res, next, identifierType);
// }, CommonController.verifyResetPassword);

/**
 * @swagger
 * /updatePassword:
 *   patch:
 *     summary: Update user password
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// router.patch("/updatePassword", checkJwt,
//     // (req, res, next) => {
//     //     const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
//     //     ValidateApiKey(req, res, next, identifierType);
//     // },
//      CommonController.updatePassword);

export default router;