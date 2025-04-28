import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../../Utils/Logger/logger.js";
import { RequestWithUser } from "../../../Middleware/checkJwt.js";
import { chatWithGPT } from "../../../Projects/AI/Chatgpt/Chatgpt.js";

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

    // Validate required fields
    const requiredFields = ['packageId', 'packageTitle', 'destination', 'passengerCount', 'tripType'];
    const missingFields = requiredFields.filter(field => !inquiryData[field]);

    // Validate dates based on trip type
    if (inquiryData.tripType === 'pre-planned' && (!inquiryData.startDate || !inquiryData.endDate)) {
      missingFields.push('startDate', 'endDate');
    } else if (inquiryData.tripType === 'custom' && (!inquiryData.startDate || !inquiryData.endDate)) {
      missingFields.push('startDate', 'endDate');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate date order
    if (inquiryData.startDate && inquiryData.endDate && inquiryData.startDate > inquiryData.endDate) {
      return res.status(400).json({
        error: "End date must be after start date"
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
        address: inquiryData.address,
        passengerCount: Number(inquiryData.passengerCount) ,
        startDate: inquiryData.startDate,
        endDate: inquiryData.endDate,
        tripType: inquiryData.tripType,
        specialRequests: inquiryData.specialRequests || "",
        status: "pending",
        userId: req.user?.id || null,
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
        address: true,
        passengerCount: true,
        startDate: true,
        endDate: true,
        tripType: true,
        specialRequests: true,
        status: true,
        createdAt: true,
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
  const userId = req.user?.id;

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
        address: true,
        passengerCount: true,
        startDate: true,
        endDate: true,
        tripType: true,
        specialRequests: true,
        status: true,
        createdAt: true,
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

/**
 * Add new response
 * @param req
 * @param res
 * @param next
 */
export const GetPrompt = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { userMessage, aiType="chatgpt", history } = req.body;
      console.log(aiType);

      // Set response headers for streaming
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      let stream: AsyncIterable<string> | undefined;
          stream=chatWithGPT(userMessage, history.messages);
 

      let message = "";

      if (!stream) {
          throw new Error("Stream is undefined");
      }

      for await (const chunk of stream) {
          message += chunk;
          res.write(`data: ${JSON.stringify({ message: chunk })}\n\n`);
      }



      /**
       * @dev Use the following to provide image later
       */

      // const imagePrompt = generateImagePrompt(message);
      // // Generate an image based on the chat output
      // const imageResponse = await openai.images.generate({
      //     model: "dall-e-3",
      //     prompt: imagePrompt, // Use the chat output as the image prompt
      // });

      // console.log("creating image");
      // console.log(imageResponse.data[0]?.url);

      // Send the image URL as a separate event
      // res.write(`data: ${JSON.stringify({ image: imageResponse.data[0]?.url })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();

  } catch (error) {
      next(error);
  }
};


// /**
// * Generate an image prompt for DALL·E based on JSON data
// */
// function generateImagePrompt(message: any): string {
//   return `
// Create a visually engaging image related to the topic: "${message}". 

// - The image should represent: ${message} || "a professional concept."}
// - Style: Modern, clean, and visually appealing.
// - Format: Suitable for LinkedIn posts.
// - Avoid text in the image.
// `;
// }