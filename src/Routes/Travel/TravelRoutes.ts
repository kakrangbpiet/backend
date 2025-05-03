import express from "express";
import {
  createTravelPackage,
  getAllTravelPackages,
  getTravelPackageById,
  updateTravelPackage,
  deleteTravelPackage,
  getTravelPackagesByStatus,
  getTravelItemsByCategory,
  updateTravelPackageStatus,
  getVideosByPackageId,
  getAllCategories,
  getAllLocations,
  getAllTitles,
  getDateAvailabilitiesByPackageId,
  getRandomVideosByPackageId,
  updateTravelPackageVideos,
  updateTravelPackageImages,
  updateTravelPackageImage
} from "../../Controllers/Travel/TravelController.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Travel
 *   description: Travel package management
 */

/**
 * @swagger
 * /Travel/travelType:
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
 *                 message:
 *                   type: string
 *                   example: "Travel packages fetched successfully"
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/travelType",
      getAllTravelPackages
    );

/**
 * @swagger
 * /Travel/travelCategory:
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
 *                 message:
 *                   type: string
 *                   example: "Travel packages for category beach fetched successfully"
 *       400:
 *         description: Bad request - category parameter is missing
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/travelCategory",
   getTravelItemsByCategory);
/**
 * @swagger
 * /Travel/status:
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
 * /Travel:
 *   post:
 *     summary: Create a new travel package
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: Travel package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
router.post("/Travel",
  checkJwt([UserCategory.SUPER_ADMIN]),
  createTravelPackage);

/**
 * @swagger
 * /Travel:
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
 *     responses:
 *       200:
 *         description: Travel package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
router.patch("/Travel/:id",
  checkJwt([UserCategory.SUPER_ADMIN]),
  updateTravelPackage);

/**
 * @swagger
 * /Travel/updateStatus:
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
router.patch("/Travel/updateStatus/:id",
  checkJwt([UserCategory.SUPER_ADMIN]),
  updateTravelPackageStatus);

/**
 * @swagger
 * /Travel:
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
router.delete("/Travel/:id",
  checkJwt([UserCategory.SUPER_ADMIN]),
  deleteTravelPackage);

  /**
 * @swagger
 * /Travel/randomvideo/{id}:
 *   get:
 *     summary: Get a random video for a travel package
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
 *         description: Random video for the package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TravelVideo'
 *                 message:
 *                   type: string
 *                   example: "Videos fetched successfully"
 *       404:
 *         description: No videos found
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/randomvideo/:id", getRandomVideosByPackageId);
  /**
 * @swagger
 * /Travel/videos/{id}:
 *   get:
 *     summary: Get all videos for a travel package
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
 *         description: List of videos for the package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TravelVideo'
 *                 message:
 *                   type: string
 *                   example: "Videos fetched successfully"
 *       404:
 *         description: No videos found
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/videos/:id", getVideosByPackageId);


/**
 * @swagger
 * /Travel/categories:
 *   get:
 *     summary: Get all distinct categories from travel packages
 *     tags: [Travel]
 *     responses:
 *       200:
 *         description: List of all distinct categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["beach", "mountain", "city"]
 *                 message:
 *                   type: string
 *                   example: "Categories fetched successfully"
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/categories", getAllCategories);

/**
 * @swagger
 * /Travel/locations:
 *   get:
 *     summary: Get all distinct locations from travel packages
 *     tags: [Travel]
 *     responses:
 *       200:
 *         description: List of all distinct locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Paris", "Tokyo", "New York"]
 *                 message:
 *                   type: string
 *                   example: "Locations fetched successfully"
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/locations", getAllLocations);

/**
 * @swagger
 * /Travel/titles:
 *   get:
 *     summary: Get all distinct titles from travel packages
 *     tags: [Travel]
 *     responses:
 *       200:
 *         description: List of all distinct titles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Summer Vacation", "Winter Getaway", "City Break"]
 *                 message:
 *                   type: string
 *                   example: "Titles fetched successfully"
 *       500:
 *         description: Internal server error
 */
router.get("/Travel/titles", getAllTitles);


/**
 * @swagger
 * /Travel:
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
 * /Travel/dates/{id}:
 *   get:
 *     summary: Get date availabilities for a specific travel package
 *     description: Returns all date availabilities for the given travel package that have a start date equal to or later than the current time
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
 *         description: List of available dates for the travel package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     dateAvailabilities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DateAvailability'
 *                 message:
 *                   type: string
 *                   example: "Date availabilities fetched successfully"
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     DateAvailability:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the date availability
 *         startDate:
 *           type: integer
 *           format: int64
 *           description: Unix timestamp for the start date
 *         endDate:
 *           type: integer
 *           format: int64
 *           description: Unix timestamp for the end date
 *         maxTravelers:
 *           type: integer
 *           description: Maximum number of travelers allowed
 *         availableSpots:
 *           type: integer
 *           description: Number of available spots remaining
 *         price:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Current price
 *         originalPrice:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Original price before any discounts
 *         travelPackageId:
 *           type: string
 *           description: ID of the associated travel package
 */
router.get("/Travel/dates/:id", getDateAvailabilitiesByPackageId);



/**
 * @swagger
 * /Travel/image/{id}:
 *   patch:
 *     summary: Update travel package main image
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
 *               image:
 *                 type: string
 *                 description: Base64 encoded image or URL
 *                 example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
 *     responses:
 *       200:
 *         description: Travel package main image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel package main image updated successfully"
 *       400:
 *         description: Bad request - image is required
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 */
router.patch("/Travel/image/:id",
  checkJwt([UserCategory.SUPER_ADMIN]),
  updateTravelPackageImage);

/**
 * @swagger
 * /Travel/images/{id}:
 *   patch:
 *     summary: Update travel package additional images
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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of base64 encoded images or URLs
 *                 example: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...", "https://example.com/image.jpg"]
 *     responses:
 *       200:
 *         description: Travel package additional images updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel package additional images updated successfully"
 *       400:
 *         description: Bad request - images array is required
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 */
router.patch("/Travel/images/:id",
  checkJwt([UserCategory.SUPER_ADMIN]),
  updateTravelPackageImages);

/**
 * @swagger
 * /Travel/videos/{id}:
 *   patch:
 *     summary: Update travel package videos
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
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of base64 encoded videos or URLs
 *                 example: ["data:video/mp4;base64,AAAAGGZ0eXBtcDQy...", "https://example.com/video.mp4"]
 *     responses:
 *       200:
 *         description: Travel package videos updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TravelPackage'
 *                 message:
 *                   type: string
 *                   example: "Travel package videos updated successfully"
 *       400:
 *         description: Bad request - videos array is required
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Travel package not found
 *       500:
 *         description: Internal server error
 */
router.patch("/Travel/videos/:id",
  checkJwt([UserCategory.SUPER_ADMIN]),
  updateTravelPackageVideos);

export default router;