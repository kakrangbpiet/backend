// import { Request, Response, NextFunction } from "express";
// import winston from "winston";
// import { prisma } from "../../Utils/db/client.js";
// import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
// import { RequestWithUser } from "../../Middleware/checkJwt.js";

// /**
//  * Complete a booking
//  */
// export const completeBooking = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {
//   const childLogger = (req as any).childLogger as winston.Logger;
//   const bookingData = req.body;
//   const userId = req.user?.id; // Assuming user is authenticated

//   try {
//     logWithMessageAndStep(
//       childLogger,
//       "Step 1",
//       "Completing booking",
//       "completeBooking",
//       JSON.stringify(bookingData),
//       "info"
//     );

//     // Validate required fields
//     const requiredFields = ['packageId', 'travelDates', 'travelers', 'contactInfo'];
//     const missingFields = requiredFields.filter(field => !bookingData[field]);

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         error: `Missing required fields: ${missingFields.join(', ')}`
//       });
//     }

//     // Verify the package exists and has availability
//     const travelPackage = await prisma.travelPackage.findUnique({
//       where: { id: bookingData.packageId }
//     });

//     if (!travelPackage) {
//       return res.status(404).json({
//         error: "Travel package not found"
//       });
//     }

//     if (travelPackage.availableSpots < bookingData.travelers.length) {
//       return res.status(400).json({
//         error: "Not enough available spots for this package"
//       });
//     }

//     // Create the booking
//     const newBooking = await prisma.booking.create({
//       data: {
//         userId,
//         packageId: bookingData.packageId,
//         travelDates: bookingData.travelDates,
//         status: "confirmed", // or "pending_payment" if payment is required
//         totalPrice: travelPackage.price * bookingData.travelers.length,
//         paymentStatus: "pending", // or "paid" if payment is completed
//         travelers: {
//           create: bookingData.travelers.map((traveler: any) => ({
//             name: traveler.name,
//             age: traveler.age,
//             passportNumber: traveler.passportNumber,
//             specialRequirements: traveler.specialRequirements || ""
//           }))
//         },
//         contactInfo: bookingData.contactInfo,
//         notes: bookingData.notes || ""
//       },
//       include: {
//         package: true,
//         travelers: true
//       }
//     });

//     // Update available spots in the package
//     await prisma.travelPackage.update({
//       where: { id: bookingData.packageId },
//       data: {
//         availableSpots: {
//           decrement: bookingData.travelers.length
//         }
//       }
//     });

//     logWithMessageAndStep(
//       childLogger,
//       "Step 2",
//       "Successfully completed booking",
//       "completeBooking",
//       `Created booking with ID: ${newBooking.id}`,
//       "info"
//     );

//     res.status(201).json({
//       data: newBooking,
//       message: "Booking completed successfully"
//     });
//   } catch (error) {
//     logWithMessageAndStep(
//       childLogger,
//       "Error Step",
//       "Error completing booking",
//       "completeBooking",
//       JSON.stringify(error),
//       "error"
//     );
//     next(error);
//   }
// };

// /**
//  * Get user's bookings
//  */
// export const getUserBookings = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {
//   const childLogger = (req as any).childLogger as winston.Logger;
//   const userId = req.user?.id;

//   try {
//     logWithMessageAndStep(
//       childLogger,
//       "Step 1",
//       "Fetching user bookings",
//       "getUserBookings",
//       `User ID: ${userId}`,
//       "info"
//     );

//     const bookings = await prisma.booking.findMany({
//       where: { userId },
//       orderBy: {
//         createdAt: "desc"
//       },
//       include: {
//         package: true,
//         travelers: true
//       }
//     });

//     logWithMessageAndStep(
//       childLogger,
//       "Step 2",
//       "Successfully fetched user bookings",
//       "getUserBookings",
//       `Found ${bookings.length} bookings for user ${userId}`,
//       "info"
//     );

//     res.status(200).json({
//       data: bookings,
//       message: "User bookings fetched successfully"
//     });
//   } catch (error) {
//     logWithMessageAndStep(
//       childLogger,
//       "Error Step",
//       "Error fetching user bookings",
//       "getUserBookings",
//       JSON.stringify(error),
//       "error"
//     );
//     next(error);
//   }
// };

// /**
//  * Get booking details by ID
//  */
// export const getBookingDetails = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {
//   const childLogger = (req as any).childLogger as winston.Logger;
//   const { id } = req.params;
//   const userId = req.user?.id;

//   try {
//     logWithMessageAndStep(
//       childLogger,
//       "Step 1",
//       "Fetching booking details",
//       "getBookingDetails",
//       `Booking ID: ${id}`,
//       "info"
//     );

//     const booking = await prisma.booking.findUnique({
//       where: { id },
//       include: {
//         package: true,
//         travelers: true,
//         payments: true // Include payment history if available
//       }
//     });

//     if (!booking) {
//       return res.status(404).json({
//         error: "Booking not found"
//       });
//     }

//     // Authorization check - user can only see their own bookings
//     if (booking.userId !== userId) {
//       return res.status(403).json({
//         error: "Unauthorized to view this booking"
//       });
//     }

//     logWithMessageAndStep(
//       childLogger,
//       "Step 2",
//       "Successfully fetched booking details",
//       "getBookingDetails",
//       `Found booking with ID: ${id}`,
//       "info"
//     );

//     res.status(200).json({
//       data: booking,
//       message: "Booking details fetched successfully"
//     });
//   } catch (error) {
//     logWithMessageAndStep(
//       childLogger,
//       "Error Step",
//       "Error fetching booking details",
//       "getBookingDetails",
//       JSON.stringify(error),
//       "error"
//     );
//     next(error);
//   }
// };

// /**
//  * Cancel a booking
//  */
// export const cancelBooking = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {
//   const childLogger = (req as any).childLogger as winston.Logger;
//   const { id } = req.params;
//   const userId = req.user?.id;

//   try {
//     logWithMessageAndStep(
//       childLogger,
//       "Step 1",
//       "Canceling booking",
//       "cancelBooking",
//       `Booking ID: ${id}`,
//       "info"
//     );

//     const booking = await prisma.booking.findUnique({
//       where: { id }
//     });

//     if (!booking) {
//       return res.status(404).json({
//         error: "Booking not found"
//       });
//     }

//     // Authorization check
//     if (booking.userId !== userId) {
//       return res.status(403).json({
//         error: "Unauthorized to cancel this booking"
//       });
//     }

//     // Check if booking can be canceled
//     if (booking.status === "cancelled") {
//       return res.status(400).json({
//         error: "Booking is already cancelled"
//       });
//     }

//     // Update booking status
//     const updatedBooking = await prisma.booking.update({
//       where: { id },
//       data: {
//         status: "cancelled",
//         cancellationDate: new Date()
//       },
//       include: {
//         package: true
//       }
//     });

//     // Return available spots to the package
//     if (updatedBooking.package) {
//       const travelersCount = await prisma.traveler.count({
//         where: { bookingId: id }
//       });

//       await prisma.travelPackage.update({
//         where: { id: updatedBooking.package.id },
//         data: {
//           availableSpots: {
//             increment: travelersCount
//           }
//         }
//       });
//     }

//     logWithMessageAndStep(
//       childLogger,
//       "Step 2",
//       "Successfully cancelled booking",
//       "cancelBooking",
//       `Cancelled booking with ID: ${id}`,
//       "info"
//     );

//     res.status(200).json({
//       data: updatedBooking,
//       message: "Booking cancelled successfully"
//     });
//   } catch (error) {
//     logWithMessageAndStep(
//       childLogger,
//       "Error Step",
//       "Error cancelling booking",
//       "cancelBooking",
//       JSON.stringify(error),
//       "error"
//     );
//     next(error);
//   }
// };

// /**
//  * Process payment for a booking
//  */
// export const processPayment = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {
//   const childLogger = (req as any).childLogger as winston.Logger;
//   const { bookingId, paymentData } = req.body;
//   const userId = req.user?.id;

//   try {
//     logWithMessageAndStep(
//       childLogger,
//       "Step 1",
//       "Processing payment",
//       "processPayment",
//       `Booking ID: ${bookingId}`,
//       "info"
//     );

//     // Validate payment data
//     if (!paymentData || !paymentData.amount || !paymentData.paymentMethod) {
//       return res.status(400).json({
//         error: "Invalid payment data"
//       });
//     }

//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId }
//     });

//     if (!booking) {
//       return res.status(404).json({
//         error: "Booking not found"
//       });
//     }

//     // Authorization check
//     if (booking.userId !== userId) {
//       return res.status(403).json({
//         error: "Unauthorized to process payment for this booking"
//       });
//     }

//     // Check if booking is already paid
//     if (booking.paymentStatus === "paid") {
//       return res.status(400).json({
//         error: "Booking is already paid"
//       });
//     }

//     // In a real application, you would integrate with a payment gateway here
//     // For demonstration, we'll just record the payment

//     const payment = await prisma.payment.create({
//       data: {
//         bookingId,
//         amount: paymentData.amount,
//         paymentMethod: paymentData.paymentMethod,
//         transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`, // Mock transaction ID
//         status: "completed",
//         paymentDate: new Date()
//       }
//     });

//     // Update booking payment status
//     await prisma.booking.update({
//       where: { id: bookingId },
//       data: {
//         paymentStatus: "paid"
//       }
//     });

//     logWithMessageAndStep(
//       childLogger,
//       "Step 2",
//       "Successfully processed payment",
//       "processPayment",
//       `Processed payment for booking ID: ${bookingId}`,
//       "info"
//     );

//     res.status(200).json({
//       data: payment,
//       message: "Payment processed successfully"
//     });
//   } catch (error) {
//     logWithMessageAndStep(
//       childLogger,
//       "Error Step",
//       "Error processing payment",
//       "processPayment",
//       JSON.stringify(error),
//       "error"
//     );
//     next(error);
//   }
// };