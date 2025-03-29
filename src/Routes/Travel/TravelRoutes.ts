import express from "express";
import * as TravelController from "../../Controllers/Travel/TravelControllerMock.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /Travel/travelType:
 *   get:
 *     summary: Get all travel items by type
 *     tags:
 *       - Travel
 *     responses:
 *       200:
 *         description: Successfully retrieved travel items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "cln4a9p6r0000q8jq9q9q9q9q"
 *                       name:
 *                         type: string
 *                         example: "Beach Vacation"
 *                       description:
 *                         type: string
 *                         example: "Relaxing beach getaway"
 *                       type:
 *                         type: string
 *                         example: "vacation"
 *                       category:
 *                         type: string
 *                         example: "beach"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00Z"
 *                 message:
 *                   type: string
 *                   example: "Travel items fetched successfully"
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/travelType", TravelController.getTravelItemsByType);

/**
 * @swagger
 * /Travel/travelCategory:
 *   get:
 *     summary: Get travel items by category
 *     tags:
 *       - Travel
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: The category of travel items to fetch
 *         example: "beach"
 *     responses:
 *       200:
 *         description: Successfully retrieved travel items by category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "cln4a9p6r0000q8jq9q9q9q9q"
 *                       name:
 *                         type: string
 *                         example: "Beach Vacation"
 *                       description:
 *                         type: string
 *                         example: "Relaxing beach getaway"
 *                       type:
 *                         type: string
 *                         example: "vacation"
 *                       category:
 *                         type: string
 *                         example: "beach"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00Z"
 *                 message:
 *                   type: string
 *                   example: "Travel items for category beach fetched successfully"
 *       400:
 *         description: Bad request - category parameter is missing
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/travelCategory", TravelController.getTravelItemsByCategory);

export default router;