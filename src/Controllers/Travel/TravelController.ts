import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";

// ... (previous imports remain the same)

/**
 * Create a new travel package with date availabilities
 */
export const createTravelPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const packageData = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Creating new travel package",
      "createTravelPackage",
      JSON.stringify(packageData),
      "info"
    );

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'location', 'category', 'image'];
    const missingFields = requiredFields.filter(field => !packageData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Calculate totals if date availabilities exist
    let maxTravelers = packageData.maxTravelers || 0;
    let availableSpots = packageData.availableSpots || 0;
    
    if (packageData.dateAvailabilities?.length > 0) {
      maxTravelers = packageData.dateAvailabilities.reduce((sum: number, da: any) => sum + (da.maxTravelers || 0), 0);
      availableSpots = packageData.dateAvailabilities.reduce((sum: number, da: any) => sum + (da.availableSpots || 0), 0);
    }

    const newPackage = await prisma.travelPackage.create({
      data: {
        title: packageData.title,
        description: packageData.description,
        price: packageData.price,
        originalPrice: packageData.originalPrice,
        image: packageData.image,
        images: packageData.images || [],
        location: packageData.location,
        category: packageData.category,
        status: packageData.status || "active",
        maxTravelers: maxTravelers > 0 ? maxTravelers : null,
        availableSpots: availableSpots > 0 ? availableSpots : null,
        travelType: packageData.travelType,
        dateAvailabilities: packageData.dateAvailabilities?.length > 0 ? {
          create: packageData.dateAvailabilities.map((da: any) => ({
            startDate: da.startDate,
            endDate: da.endDate,
            maxTravelers: da.maxTravelers,
            availableSpots: da.availableSpots
          }))
        } : undefined
      },
      include: {
        dateAvailabilities: true
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully created travel package",
      "createTravelPackage",
      `Created package with ID: ${newPackage.id}`,
      "info"
    );

    res.status(201).json({
      data: newPackage,
      message: "Travel package created successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error creating travel package",
      "createTravelPackage",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get travel package by ID with date availabilities
 */
export const getTravelPackageById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching travel package by ID",
      "getTravelPackageById",
      `ID: ${id}`,
      "info"
    );

    const travelPackage = await prisma.travelPackage.findUnique({
      where: { id },
      include: {
        dateAvailabilities: true
      }
    });

    if (!travelPackage) {
      return res.status(404).json({
        error: "Travel package not found"
      });
    }

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched travel package",
      "getTravelPackageById",
      `Found package with ID: ${id}`,
      "info"
    );

    res.status(200).json({
      data: travelPackage,
      message: "Travel package fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching travel package",
      "getTravelPackageById",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Update travel package with date availabilities
 */
export const updateTravelPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const packageData = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Updating travel package",
      "updateTravelPackage",
      `ID: ${id}, Data: ${JSON.stringify(packageData)}`,
      "info"
    );

    // First, delete all existing date availabilities
    await prisma.dateAvailability.deleteMany({
      where: { travelPackageId: id }
    });

    // Calculate totals if date availabilities exist
    let maxTravelers = packageData.maxTravelers || 0;
    let availableSpots = packageData.availableSpots || 0;
    
    if (packageData.dateAvailabilities?.length > 0) {
      maxTravelers = packageData.dateAvailabilities.reduce((sum: number, da: any) => sum + (da.maxTravelers || 0), 0);
      availableSpots = packageData.dateAvailabilities.reduce((sum: number, da: any) => sum + (da.availableSpots || 0), 0);
    }

    const updatedPackage = await prisma.travelPackage.update({
      where: { id },
      data: {
        title: packageData.title,
        description: packageData.description,
        price: packageData.price,
        originalPrice: packageData.originalPrice,
        image: packageData.image,
        images: packageData.images,
        location: packageData.location,
        category: packageData.category,
        status: packageData.status,
        maxTravelers: maxTravelers > 0 ? maxTravelers : null,
        availableSpots: availableSpots > 0 ? availableSpots : null,
        travelType: packageData.travelType,
        dateAvailabilities: packageData.dateAvailabilities?.length > 0 ? {
          create: packageData.dateAvailabilities.map((da: any) => ({
            startDate: da.startDate,
            endDate: da.endDate,
            maxTravelers: da.maxTravelers,
            availableSpots: da.availableSpots
          }))
        } : undefined
      },
      include: {
        dateAvailabilities: true
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated travel package",
      "updateTravelPackage",
      `Updated package with ID: ${id}`,
      "info"
    );

    res.status(200).json({
      data: updatedPackage,
      message: "Travel package updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating travel package",
      "updateTravelPackage",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get all travel packages
 */
export const getAllTravelPackages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching all travel packages",
      "getAllTravelPackages",
      "",
      "info"
    );

    const packages = await prisma.travelPackage.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        dateAvailabilities: true
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched travel packages",
      "getAllTravelPackages",
      `Found ${packages.length} packages`,
      "info"
    );

    res.status(200).json({
      data: packages,
      message: "Travel packages fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching travel packages",
      "getAllTravelPackages",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};


/**
 * Delete travel package
 */
export const deleteTravelPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Deleting travel package",
      "deleteTravelPackage",
      `ID: ${id}`,
      "info"
    );

    await prisma.travelPackage.delete({
      where: { id }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully deleted travel package",
      "deleteTravelPackage",
      `Deleted package with ID: ${id}`,
      "info"
    );

    res.status(200).json({
      message: "Travel package deleted successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error deleting travel package",
      "deleteTravelPackage",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get travel packages by status
 */
export const getTravelPackagesByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { status } = req.query;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching travel packages by status",
      "getTravelPackagesByStatus",
      `Status: ${status}`,
      "info"
    );

    if (!status) {
      return res.status(400).json({
        error: "Status query parameter is required"
      });
    }

    const packages = await prisma.travelPackage.findMany({
      where: {
        status: String(status)
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        dateAvailabilities: true
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched travel packages by status",
      "getTravelPackagesByStatus",
      `Found ${packages.length} packages with status ${status}`,
      "info"
    );

    res.status(200).json({
      data: packages,
      message: `Travel packages with status ${status} fetched successfully`
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching travel packages by status",
      "getTravelPackagesByStatus",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get travel packages by category and status
 */
export const getTravelItemsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { category, status } = req.query;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching travel packages by category and status",
      "getTravelItemsByCategory",
      `Category: ${category}, Status: ${status}`,
      "info"
    );

    if (!category) {
      return res.status(400).json({
        error: "Category query parameter is required"
      });
    }

    const filters: any = { category: String(category) };
    if (status) {
      filters.status = String(status);
    } else {
      filters.status = "active"; // Default to active status
    }

    const packages = await prisma.travelPackage.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        dateAvailabilities: true
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched travel packages by category and status",
      "getTravelItemsByCategory",
      `Found ${packages.length} packages in category ${category} with status ${status || 'active'}`,
      "info"
    );

    res.status(200).json({
      data: packages,
      message: `Travel packages in category ${category} with status ${status || 'active'} fetched successfully`
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching travel packages by category and status",
      "getTravelItemsByCategory",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Update travel package status
 */
export const updateTravelPackageStatus = async (
  req: Request,
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
      "Updating travel package status",
      "updateTravelPackageStatus",
      `ID: ${id}, New Status: ${status}`,
      "info"
    );

    if (!status) {
      return res.status(400).json({
        error: "Status is required in request body"
      });
    }

    const validStatuses = ["active", "inactive", "draft", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const updatedPackage = await prisma.travelPackage.update({
      where: { id },
      data: { status }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated travel package status",
      "updateTravelPackageStatus",
      `Updated package ID: ${id} to status: ${status}`,
      "info"
    );

    res.status(200).json({
      data: updatedPackage,
      message: "Travel package status updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating travel package status",
      "updateTravelPackageStatus",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};