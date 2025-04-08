import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../../Utils/Logger/logger.js";
import { RequestWithUser } from "../../../Middleware/checkJwt.js";

/**
 * Create a new travel inquiry
 */
export const createTravelInquiry = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const inquiryData = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Creating new travel inquiry",
      "createTravelInquiry",
      JSON.stringify(inquiryData),
      "info"
    );

    // Validate required fields based on interface
    const requiredFields = ['packageId', 'packageTitle', 'destination', 'passengerCount', 'travelDates'];
    const missingFields = requiredFields.filter(field => !inquiryData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Verify the package exists
    const packageExists = await prisma.travelPackage.findUnique({
      where: { id: inquiryData.packageId }
    });

    if (!packageExists) {
      return res.status(404).json({
        error: "Travel package not found"
      });
    }

    const newInquiry = await prisma.travelInquiry.create({
      data: {
        packageId: inquiryData.packageId,
        packageTitle: inquiryData.packageTitle,
        destination: inquiryData.destination,
        departure: inquiryData.departure,
        passengerCount: inquiryData.passengerCount,
        travelDates: inquiryData.travelDates,
        specialRequests: inquiryData.specialRequests || "",
        status: "pending",
        userId: req.user?.id || null,
        // Include IUser fields if provided
        name: inquiryData.name || null,
        email: inquiryData.email || null,
        phoneNumber: inquiryData.phoneNumber || null
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully created travel inquiry",
      "createTravelInquiry",
      `Created inquiry with ID: ${newInquiry.id}`,
      "info"
    );

    res.status(201).json({
      data: newInquiry,
      message: "Travel inquiry created successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error creating travel inquiry",
      "createTravelInquiry",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

// Update getUserInquiries to match interface fields
export const getUserInquiries = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { userId } = req.params;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching user travel inquiries",
      "getUserInquiries",
      `User ID: ${userId}`,
      "info"
    );

    const inquiries = await prisma.travelInquiry.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        packageId: true,
        packageTitle: true,
        destination: true,
        departure: true,
        passengerCount: true,
        travelDates: true,
        specialRequests: true,
        status: true,
        createdAt: true,
        // IUser fields
        name: true,
        email: true,
        phoneNumber: true,
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched user inquiries",
      "getUserInquiries",
      `Found ${inquiries.length} inquiries for user ${userId}`,
      "info"
    );

    res.status(200).json({
      data: inquiries,
      message: "User inquiries fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching user inquiries",
      "getUserInquiries",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get inquiry details by ID
 */
export const getInquiryDetails = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    const childLogger = (req as any).childLogger as winston.Logger;
    const { id } = req.params;
    const userId = req.user?.id; // For authorization check
  
    try {
      logWithMessageAndStep(
        childLogger,
        "Step 1",
        "Fetching inquiry details",
        "getInquiryDetails",
        `Inquiry ID: ${id}`,
        "info"
      );
  
      const inquiry = await prisma.travelInquiry.findUnique({
        where: { id },
        select: {
          id: true,
          packageId: true,
          packageTitle: true,
          destination: true,
          departure: true,
          passengerCount: true,
          travelDates: true,
          specialRequests: true,
          status: true,
          createdAt: true,
          // IUser fields
          name: true,
          email: true,
          phoneNumber: true,
        
        }
      });
  
      if (!inquiry) {
        return res.status(404).json({
          error: "Inquiry not found"
        });
      }
  
  
      logWithMessageAndStep(
        childLogger,
        "Step 2",
        "Successfully fetched inquiry details",
        "getInquiryDetails",
        `Found inquiry with ID: ${id}`,
        "info"
      );
  
      res.status(200).json({
        data: inquiry,
        message: "Inquiry details fetched successfully"
      });
    } catch (error) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        "Error fetching inquiry details",
        "getInquiryDetails",
        JSON.stringify(error),
        "error"
      );
      next(error);
    }
  };

// Update status values in updateInquiryStatus
export const updateInquiryStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { status } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Updating inquiry status",
      "updateInquiryStatus",
      `ID: ${id}, New Status: ${status}`,
      "info"
    );

    if (!status) {
      return res.status(400).json({
        error: "Status is required in request body"
      });
    }

    // Update valid statuses to match interface
    const validStatuses = ["pending", "confirmed", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const updatedInquiry = await prisma.travelInquiry.update({
      where: { id },
      data: { status },
     
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated inquiry status",
      "updateInquiryStatus",
      `Updated inquiry ID: ${id} to status: ${status}`,
      "info"
    );

    res.status(200).json({
      data: updatedInquiry,
      message: "Inquiry status updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating inquiry status",
      "updateInquiryStatus",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};