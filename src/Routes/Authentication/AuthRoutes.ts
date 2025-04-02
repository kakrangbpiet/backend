import express from "express";
import * as PasswordLessLogin from "../../Controllers/Post/PasswordLessLogin.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /passwordless/registerUser:
 *   post:
 *     summary: Register a new user
 *     tags: 
 *       - PasswordLess
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               category:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post("/passwordless/registerUser", PasswordLessLogin.registerUser);


/**
 * @swagger
 * /passwordless/login:
 *   post:
 *     summary: User login with OTP
 *     tags: 
 *       - PasswordLess
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
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/passwordless/login", PasswordLessLogin.loginWithOtp);

/**
 * @swagger
 * /passwordless/verifyOtp:
 *   post:
 *     summary: Verify OTP for login
 *     tags: 
 *       - PasswordLess
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               trxId:
 *                 type: string
 *                 example: "trx_abc123xyz"
 *               deviceId:
 *                 type: string
 *                 example: "device_12345"
 *               identifier:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/passwordless/verifyOtp", PasswordLessLogin.verifyOtpLogin);


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (verified and unverified)
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Returns all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     verifiedUsers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VerifiedUser'
 *                     unverifiedUsers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UnverifiedUser'
 *                 message:
 *                   type: string
 *                   example: "Users fetched successfully"
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     VerifiedUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         address:
 *           type: string
 *         category:
 *           type: string
 *         accountStatus:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UnverifiedUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
router.get("/getAllUsers",
      checkJwt([UserCategory.SUPER_ADMIN]),
     PasswordLessLogin.getAllUsers);

export default router;

