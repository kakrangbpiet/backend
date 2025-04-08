import { Router } from "express";
import { createTravelInquiry, getUserInquiries, getInquiryDetails, updateInquiryStatus } from "../../Controllers/Travel/Inquiry/TravelInquiry.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = Router();

/**
 * @swagger
 * /TravelInquiry:
 *   post:
 *     summary: Create a new travel inquiry
 *     tags: [Travel Inquiry]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - packageTitle
 *               - destination
 *               - passengerCount
 *               - travelDates
 *             properties:
 *               packageId:
 *                 type: string
 *                 example: 67e90fc9d3261fe65c89a6a2
 *               packageTitle:
 *                 type: string
 *                 example: "Trek"
 *               destination:
 *                 type: string
 *                 example: "Nepal"
 *               passengerCount:
 *                 type: integer
 *                 example: 2
 *               travelDates:
 *                 type: string
 *                 example: "2022-12-12"
 *               specialRequests:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: "Metakul"
 *               email:
 *                 type: string
 *                 example: "Metakul"
 *               phoneNumber:
 *                 type: string
 *                 example: "7878787878"
 *     responses:
 *       201:
 *         description: Travel inquiry created successfully
 *       400:
 *         description: Missing required fields
 */
router.post("/TravelInquiry",
    checkJwt([UserCategory.User,UserCategory.SUPER_ADMIN]),
    createTravelInquiry
);

/**
 * @swagger
 * /TravelInquiry/{userId}:
 *   get:
 *     summary: Get all travel inquiries for the authenticated user
 *     tags: [Travel Inquiry]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's travel inquiries
 *       401:
 *         description: Unauthorized
 */
router.get("/TravelInquiry/:userId",
    checkJwt([UserCategory.User,UserCategory.SUPER_ADMIN]),
    getUserInquiries);

/**
 * @swagger
 * /TravelInquiry/{id}:
 *   get:
 *     summary: Get travel inquiry details by ID
 *     tags: [Travel Inquiry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inquiry details fetched successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Inquiry not found
 */
router.get("/TravelInquiry/:id", getInquiryDetails);

/**
 * @swagger
 * /TravelInquiry/status/{id}:
 *   patch:
 *     summary: Update travel inquiry status
 *     tags: [Travel Inquiry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, rejected, completed]
 *     responses:
 *       200:
 *         description: Inquiry status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Inquiry not found
 */
router.patch("/TravelInquiry/status/:id",
    checkJwt([UserCategory.User,UserCategory.SUPER_ADMIN]),
    updateInquiryStatus
);

export default router;
