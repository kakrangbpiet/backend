import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
import { uploadFileToS3 } from "../../Projects/Aws/S3Bucket.js";


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
    const requiredFields = ['title', 'description',  'location', 'category', 'image'];
    const missingFields = requiredFields.filter(field => !packageData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Upload main image to S3
    let imageUrl = packageData.image;
      imageUrl = await uploadFileToS3(
        packageData.image,
        `image_${Date.now()}.jpg`,
        'image/jpeg'
      ) || packageData.image; // Fallback to original if upload fails

    // Upload additional images to S3
    let imagesUrls:string[] = [];
    if (packageData.images?.length > 0) {
      for (const img of packageData.images) {
          const url = await uploadFileToS3(
            img,
            `image_${Date.now()}.jpg`,
            'image/jpeg'
          );
          if (url) imagesUrls.push(url);
      
      }
    }

    // Upload videos to S3
    let videoUrls:string[] = [];
    if (packageData.videos?.length > 0) {
      for (const video of packageData.videos) {
          const url = await uploadFileToS3(
            video,
            `video_${Date.now()}.mp4`,
            'video/mp4'
          );
          if (url) videoUrls.push(url);
      
      }
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
        image: imageUrl,
        images: imagesUrls,
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
            availableSpots: da.availableSpots,
            price: da.price,
            originalPrice: da.originalPrice
          }))
        } : undefined,
        activities: packageData.activities || [], 
        videos: videoUrls.length > 0 ? {
          create: videoUrls.map((url: string) => ({
            awsUrl: url
          }))
        } : undefined,
      },
      include: {
        dateAvailabilities: true,
        videos: true
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
 * Get travel package by ID with optional field selection
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

    // Get fields to select from query
    const selectFields = req.query.select as string | undefined;
    let select: any = undefined;

    if (selectFields) {
      // If specific fields are requested, build the select object
      const fields = selectFields.split(',');
      select = {
        id: fields.includes('id'),
        title: fields.includes('title'),
        description: fields.includes('description'),
        image: fields.includes('image'),
        images: fields.includes('images'),
        location: fields.includes('location'),
        category: fields.includes('category'),
        status: fields.includes('status'),
        maxTravelers: fields.includes('maxTravelers'),
        availableSpots: fields.includes('availableSpots'),
        travelType: fields.includes('travelType'),
        createdAt: fields.includes('createdAt'),
        updatedAt: fields.includes('updatedAt'),
        activities: fields.includes('activities'),
        dateAvailabilities: fields.includes('dateAvailabilities'),
        videos: fields.includes('videos')
      };

      // Always include id for reference
      select.id = true;
    } else {
      // If no fields specified, include all fields
      select = {
        id: true,
        title: true,
        description: true,
        image: true,
        images: true,
        location: true,
        category: true,
        status: true,
        maxTravelers: true,
        availableSpots: true,
        travelType: true,
        createdAt: true,
        updatedAt: true,
        activities: true,
        dateAvailabilities: true,
        videos: true
      };
    }

    const travelPackage = await prisma.travelPackage.findUnique({
      where: { id },
      select
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
 * Update travel package with date availabilities and videos
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


    // Delete existing date availabilities
    await prisma.dateAvailability.deleteMany({
      where: { travelPackageId: id }
    });


    // Calculate totals
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
        location: packageData.location,
        category: packageData.category,
        status: packageData.status || "active",
        maxTravelers: maxTravelers > 0 ? maxTravelers : null,
        availableSpots: availableSpots > 0 ? availableSpots : null,
        travelType: packageData.travelType,
        activities: packageData.activities || [], 
        dateAvailabilities: packageData.dateAvailabilities?.length > 0
          ? {
              create: packageData.dateAvailabilities.map((da: any) => ({
                startDate: da.startDate,
                endDate: da.endDate,
                maxTravelers: da.maxTravelers,
                availableSpots: da.availableSpots,
                price: da.price,
                originalPrice: da.originalPrice
              }))
            }
          : undefined,
      },
      include: {
        dateAvailabilities: true,
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated travel package",
      "updateTravelPackage",
      `Updated package ID: ${id}`,
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
 * Get all travel packages with pagination and field selection
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

    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;

    // Get filter parameters
    const status = req.query.status as string | undefined;
    const location = req.query.location as string | undefined;
    const category = req.query.category as string | undefined;

    // Get fields to select from query
    const selectFields = req.query.select as string | undefined;
    let select: any = undefined;

    if (selectFields) {
      // If specific fields are requested, build the select object
      const fields = selectFields.split(',');
      select = {
        id: fields.includes('id'),
        title: fields.includes('title'),
        description: fields.includes('description'),
        image: fields.includes('image'),
        location: fields.includes('location'),
        category: fields.includes('category'),
        status: fields.includes('status'),
        maxTravelers: fields.includes('maxTravelers'),
        availableSpots: fields.includes('availableSpots'),
        travelType: fields.includes('travelType'),
        createdAt: fields.includes('createdAt'),
        updatedAt: fields.includes('updatedAt'),
        dateAvailabilities: fields.includes('dateAvailabilities')
      };

      // Always include id for reference
      select.id = true;
    } else {
      // If no fields specified, include all except videos
      select = {
        id: true,
        title: true,
        description: true,
        image: true,
        location: true,
        category: true,
        status: true,
        maxTravelers: true,
        availableSpots: true,
        travelType: true,
        createdAt: true,
        updatedAt: true,
        dateAvailabilities: true
      };
    }

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (location) where.location = location;
    if (category) where.category = category;

    // Get total count for pagination metadata
    const totalCount = await prisma.travelPackage.count({ where });

    const packages = await prisma.travelPackage.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc"
      },
      select
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
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
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



/**
 * Get a single random video by travel package ID, including array length and a random video
 */
export const getRandomVideosByPackageId = async (
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
      "Fetching videos for travel package",
      "getVideosByPackageId",
      `ID: ${id}`,
      "info"
    );
    // Count videos without fetching them
    const videoCount = await prisma.travelVideo.count({
      where: { travelPackageId: id }
    });

    // Fetch one random video if available
    let randomVideo:any = [];
    if (videoCount > 0) {
      const randomIndex = Math.floor(Math.random() * videoCount);
      const randomVideos = await prisma.travelVideo.findMany({
        where: { travelPackageId: id },
        skip: randomIndex,
        take: 1
      });
      randomVideo = randomVideos[0] || [];
    }

    res.status(200).json({
      data: {
        videoCount,
        randomVideo
      },
      message: "Videos fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching videos",
      "getVideosByPackageId",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};
/**
 * Get videos by travel package ID, including array length and a random video
 */
export const getVideosByPackageId = async (
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
      "Fetching videos for travel package",
      "getVideosByPackageId",
      `ID: ${id}`,
      "info"
    );
    // Count videos without fetching them
    const videoCount = await prisma.travelVideo.count({
      where: { travelPackageId: id }
    });

    // Fetch one random video if available
    let allVideos:any = [];
    if (videoCount > 0) {
      const allVideoss = await prisma.travelVideo.findMany({
        where: { travelPackageId: id },
      });
      allVideos = allVideoss || [];
    }

    res.status(200).json({
      data: {
        videoCount,
        allVideos
      },
      message: "Videos fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching videos",
      "getVideosByPackageId",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get dateAvailabilities by travel package ID,
 */
export const getDateAvailabilitiesByPackageId = async (
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
      "Fetching date availabilities for travel package",
      "getDateAvailabilitiesByPackageId",
      `ID: ${id}`,
      "info"
    );
    
    // Get current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Fetch date availabilities where startDate is >= current time
    const dateAvailabilities = await prisma.dateAvailability.findMany({
      where: { 
        travelPackageId: id,
        startDate: {
          gte: currentTimestamp
        }
      }
    });

    res.status(200).json({
      data: dateAvailabilities,
      message: "Date availabilities fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching date availabilities",
      "getDateAvailabilitiesByPackageId",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get all distinct categories from travel packages
 */
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  try {
    logWithMessageAndStep(childLogger, "Step 1", "Fetching all categories", "getAllCategories", "", "info");

    const categories = await prisma.travelPackage.findMany({
      distinct: ['category'],
      select: { category: true },
    });

    res.status(200).json({
      data: categories.map(c => c.category),
      message: "Categories fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(childLogger, "Error Step", "Error fetching categories", "getAllCategories", JSON.stringify(error), "error");
    next(error);
  }
};

/**
 * Get all distinct locations from travel packages
 */
export const getAllLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  try {
    logWithMessageAndStep(childLogger, "Step 1", "Fetching all locations", "getAllLocations", "", "info");

    const locations = await prisma.travelPackage.findMany({
      distinct: ['location'],
      select: { location: true },
    });

    res.status(200).json({
      data: locations.map(l => l.location),
      message: "Locations fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(childLogger, "Error Step", "Error fetching locations", "getAllLocations", JSON.stringify(error), "error");
    next(error);
  }
};

/**
 * Get all distinct titles from travel packages with optional status filter
 */
export const getAllTitles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  try {
    logWithMessageAndStep(childLogger, "Step 1", "Fetching all titles", "getAllTitles", "", "info");

    // Get status from query params, default to 'active' if not provided
    const status = req.query.status as string || 'active';

    const titles = await prisma.travelPackage.findMany({
      where: {
        status: status
      },
      distinct: ['title'],
      select: { id: true, title: true },
    });

    res.status(200).json({
      data: titles,
      message: "Titles fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(childLogger, "Error Step", "Error fetching titles", "getAllTitles", JSON.stringify(error), "error");
    next(error);
  }
};



/**
 * Update travel package main image
 */
export const updateTravelPackageImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { image } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Updating travel package main image",
      "updateTravelPackageImage",
      `ID: ${id}`,
      "info"
    );

    if (!image) {
      return res.status(400).json({
        error: "Image is required in request body"
      });
    }

    // Upload new image to S3
    let imageUrl = image;
      imageUrl = await uploadFileToS3(
        image,
        `image_${Date.now()}.jpg`,
        'image/jpeg'
      ) || image; // Fallback to original if upload fails

    const updatedPackage = await prisma.travelPackage.update({
      where: { id },
      data: { image: imageUrl }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated travel package main image",
      "updateTravelPackageImage",
      `Updated package ID: ${id}`,
      "info"
    );

    res.status(200).json({
      data: updatedPackage,
      message: "Travel package main image updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating travel package main image",
      "updateTravelPackageImage",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Update travel package additional images
 */
export const updateTravelPackageImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { images } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Updating travel package additional images",
      "updateTravelPackageImages",
      `ID: ${id}`,
      "info"
    );

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        error: "Images array is required in request body"
      });
    }

    // Upload new images to S3
    let imagesUrls: string[] = [];
    for (const img of images) {
        const url = await uploadFileToS3(
          img,
          `image_${Date.now()}.jpg`,
          'image/jpeg'
        );
        if (url) imagesUrls.push(url);
   
    }

    const updatedPackage = await prisma.travelPackage.update({
      where: { id },
      data: { images: imagesUrls }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated travel package additional images",
      "updateTravelPackageImages",
      `Updated package ID: ${id}`,
      "info"
    );

    res.status(200).json({
      data: updatedPackage,
      message: "Travel package additional images updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating travel package additional images",
      "updateTravelPackageImages",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Update travel package videos
 */
export const updateTravelPackageVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { videos } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Updating travel package videos",
      "updateTravelPackageVideos",
      `ID: ${id}`,
      "info"
    );

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({
        error: "Videos array is required in request body"
      });
    }

    // First delete existing videos
    await prisma.travelVideo.deleteMany({
      where: { travelPackageId: id }
    });

    // Upload new videos to S3 and create records
    let videoUrls: string[] = [];
    for (const video of videos) {
        const url = await uploadFileToS3(
          video,
          `video_${Date.now()}.mp4`,
          'video/mp4'
        );
        if (url) videoUrls.push(url);
    }

    // Create new video records
    if (videoUrls.length > 0) {
      await prisma.travelVideo.createMany({
        data: videoUrls.map(url => ({
          awsUrl: url,
          travelPackageId: id
        }))
      });
    }

    // Get updated package with videos
    const updatedPackage = await prisma.travelPackage.findUnique({
      where: { id },
      include: { videos: true }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated travel package videos",
      "updateTravelPackageVideos",
      `Updated package ID: ${id}`,
      "info"
    );

    res.status(200).json({
      data: updatedPackage,
      message: "Travel package videos updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating travel package videos",
      "updateTravelPackageVideos",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};