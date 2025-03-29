import express from "express";
import * as PasswordLessLogin from "../../Controllers/Post/PasswordLessLogin.js";

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


export default router;