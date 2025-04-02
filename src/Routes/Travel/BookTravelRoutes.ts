// import express from "express";
// import { completeBooking, getUserBookings, getBookingDetails } from "../../Controllers/Travel/BookTravel";

// const router = express.Router();



// /**
//  * @swagger
//  * /api/travel/book:
//  *   post:
//  *     summary: Complete Payment 
//  *     tags: [Travel Booking]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userId:
//  *                 type: string
//  *               packageId:
//  *                 type: string
//  *               travelDates:
//  *                 type: string
//  *               numberOfTravelers:
//  *                 type: integer
//  *               paymentStatus:
//  *                 type: string
//  *                 enum: [pending, completed]
//  *     responses:
//  *       201:
//  *         description: Travel booked successfully
//  */
// router.post("/travel/book", completeBooking);

// /**
//  * @swagger
//  * /api/travel/bookings:
//  *   get:
//  *     summary: Get user's travel bookings
//  *     tags: [Travel Booking]
//  *     responses:
//  *       200:
//  *         description: Successfully fetched bookings
//  */
// router.get("/travel/bookings", getUserBookings);

// /**
//  * @swagger
//  * /api/travel/bookings/{id}:
//  *   get:
//  *     summary: Get details of a travel booking
//  *     tags: [Travel Booking]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Booking details fetched successfully
//  */
// router.get("/travel/bookings/:id", getBookingDetails);

// export default router;
