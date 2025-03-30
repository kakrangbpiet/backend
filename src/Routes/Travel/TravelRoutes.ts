import express from "express";
import {
  createTravelPackage,
  getAllTravelPackages,
  getTravelPackageById,
  updateTravelPackage,
  deleteTravelPackage,
  getTravelPackagesByStatus,
  getTravelItemsByCategory,
  updateTravelPackageStatus
} from "../../Controllers/Travel/TravelController.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Travel
 *   description: Travel package management
 */

/**
 * @swagger
 * /backendApi/Travel/travelType:
 *   get:
 *     summary: Get all travel packages
 *     tags: [Travel]
 *     responses:
 *       200:
 *         description: List of all travel packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel packages fetched successfully"
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/travelType", getAllTravelPackages);

/**
 * @swagger
 * /backendApi/Travel/travelCategory:
 *   get:
 *     summary: Get travel packages by category
 *     tags: [Travel]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Category to filter by
 *     responses:
 *       200:
 *         description: List of travel packages in specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel packages for category beach fetched successfully"
 *       400:
 *         description: Bad request - category parameter is missing
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/travelCategory", getTravelItemsByCategory);
/**
 * @swagger
 * /backendApi/Travel/status:
 *   get:
 *     summary: Get travel packages by status
 *     tags: [Travel]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: Status to filter by
 *     responses:
 *       200:
 *         description: List of travel packages in specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel packages for status beach fetched successfully"
 *       400:
 *         description: Bad request - status parameter is missing
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/status", getTravelPackagesByStatus);

/**
 * @swagger
 * /backendApi/Travel:
 *   get:
 *     summary: Get a specific travel package by ID
 *     tags: [Travel]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Travel package ID
 *     responses:
 *       200:
 *         description: Travel package details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel package fetched successfully"
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/:id", getTravelPackageById);

/**
 * @swagger
 * /backendApi/Travel:
 *   post:
 *     summary: Create a new travel package
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TravelPackageInput'
 *     responses:
 *       201:
 *         description: Travel package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel package created successfully"
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post("/Travel", createTravelPackage);

/**
 * @swagger
 * /backendApi/Travel:
 *   patch:
 *     summary: Update a travel package
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Travel package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TravelPackageInput'
 *     responses:
 *       200:
 *         description: Travel package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel package updated successfully"
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 */
router.patch("/Travel/:id", updateTravelPackage);

/**
 * @swagger
 * /backendApi/Travel/updateStatus:
 *   patch:
 *     summary: Update travel package status
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Travel package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, sold-out, coming-soon]
 *                 example: "inactive"
 *     responses:
 *       200:
 *         description: Travel package status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel package status updated successfully"
 *       400:
 *         description: Bad request - invalid status
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 */
router.patch("/Travel/updateStatus/:id", updateTravelPackageStatus);

/**
 * @swagger
 * /backendApi/Travel:
 *   delete:
 *     summary: Delete a travel package
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Travel package ID
 *     responses:
 *       200:
 *         description: Travel package deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Travel package deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 */
router.delete("/Travel/:id", deleteTravelPackage);

export default router;