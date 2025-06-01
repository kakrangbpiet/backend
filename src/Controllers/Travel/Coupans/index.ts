import { Response, NextFunction } from "express";
import winston from "winston";
import { logWithMessageAndStep } from "../../../Utils/Logger/logger.js";
import { prisma } from "../../../Utils/db/client.js";
import { DbError } from "../../../DataTypes/enums/Error.js";
import { RequestWithUser } from "../../../Middleware/checkJwt.js";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Import for specific Prisma error handling

export interface CouponCreateInput {
  name: string;
  description?: string;
  logo?: string | null;
  code: string;
  maxUsers: number;
  expiryDate: Date;
  couponType: 'website' | 'personal';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  userId?: string;
  status?: boolean; // Changed from string to boolean for clarity
}

export interface CouponUpdateInput {
  name?: string;
  description?: string;
  logo?: string | null;
  maxUsers?: number;
  expiryDate?: Date;
  isActive?: boolean;
  minOrderAmount?: number;
}

/**
 * Controller to create a new coupon
 */
export const createCoupon = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;

  if (!childLogger) {
    return next(new Error("Internal Server Error: Logger not found."));
  }

  try {
    const {
      name,
      status, // Now expected as boolean
      description,
      logo,
      code,
      maxUsers,
      expiryDate,
      couponType,
      discountType,
      discountValue,
      minOrderAmount
    } = req.body as CouponCreateInput;

    // Validate required fields
    if (!name || !code || !expiryDate || !couponType || !discountType || discountValue === undefined) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        "Missing required coupon fields",
        "createCoupon",
        JSON.stringify(req.body),
        "warn"
      );
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate discount value based on type
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        "Invalid percentage discount value",
        "createCoupon",
        JSON.stringify({ discountValue }),
        "warn"
      );
      return res.status(400).json({ error: "Percentage discount must be between 0 and 100" });
    }

    if (discountType === 'fixed' && discountValue < 0) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        "Invalid fixed discount value",
        "createCoupon",
        JSON.stringify({ discountValue }),
        "warn"
      );
      return res.status(400).json({ error: "Fixed discount must be positive" });
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Coupon code already exists: ${code}`,
        "createCoupon",
        "",
        "warn"
      );
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    // Prepare data for coupon creation
    const couponData: {
        name: string;
        description?: string;
        logo?: string | null;
        code: string;
        maxUsers: number;
        expiryDate: Date;
        couponType: 'website' | 'personal';
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        minOrderAmount?: number;
        isActive: boolean;
        userId?: string;
    } = {
      name,
      description,
      logo,
      code,
      maxUsers,
      expiryDate: new Date(expiryDate),
      couponType,
      discountType,
      discountValue,
      minOrderAmount,
      isActive: status ?? true // Default to true if status is not provided
    };

    if (couponType === 'personal') {
      if (!req.user?.id) {
        logWithMessageAndStep(
          childLogger,
          "Authorization Error",
          "Personal coupon requires user ID",
          "createCoupon",
          "",
          "warn"
        );
        return res.status(400).json({ error: "Personal coupon requires user ID" });
      }
      couponData.userId = req.user.id;
    }

    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Creating new coupon",
      "createCoupon",
      JSON.stringify(couponData),
      "info"
    );

    const newCoupon = await prisma.coupon.create({
      data: couponData
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Coupon created successfully",
      "createCoupon",
      JSON.stringify(newCoupon),
      "info"
    );

    res.status(201).json({
      message: "Coupon created successfully",
      data: newCoupon
    });

  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error creating coupon",
      "createCoupon",
      JSON.stringify(error),
      "error"
    );
    return next(DbError.ErrorOfPrisma(error));
  }
};

/**
 * Controller to update a coupon
 */
export const updateCoupon = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const couponId = req.params.id;

  if (!childLogger) {
    return next(new Error("Internal Server Error: Logger not found."));
  }

  if (!couponId) {
    logWithMessageAndStep(
      childLogger,
      "Validation Error",
      "Missing coupon ID",
      "updateCoupon",
      "",
      "warn"
    );
    return res.status(400).json({ error: "Coupon ID is required" });
  }

  try {
    const updateData: CouponUpdateInput = req.body;

    // Validate expiry date if provided
    if (updateData.expiryDate) {
      const expiryDate = new Date(updateData.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        logWithMessageAndStep(
          childLogger,
          "Validation Error",
          "Invalid expiry date",
          "updateCoupon",
          JSON.stringify({ expiryDate: updateData.expiryDate }),
          "warn"
        );
        return res.status(400).json({ error: "Invalid expiry date" });
      }
      updateData.expiryDate = expiryDate;
    }

    logWithMessageAndStep(
      childLogger,
      "Step 1",
      `Updating coupon ${couponId}`,
      "updateCoupon",
      JSON.stringify(updateData),
      "info"
    );

    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Coupon updated successfully",
      "updateCoupon",
      JSON.stringify(updatedCoupon),
      "info"
    );

    res.status(200).json({
      message: "Coupon updated successfully",
      data: updatedCoupon
    });

  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      `Error updating coupon ${couponId}`,
      "updateCoupon",
      JSON.stringify(error),
      "error"
    );
    // Handle specific Prisma error for record not found
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        return res.status(404).json({ error: "Coupon not found" });
      }
    }
    return next(DbError.ErrorOfPrisma(error));
  }
};

/**
 * Controller to get coupon by ID
 */
export const getCouponById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const couponId = req.params.id;

  if (!childLogger) {
    return next(new Error("Internal Server Error: Logger not found."));
  }

  if (!couponId) {
    logWithMessageAndStep(
      childLogger,
      "Validation Error",
      "Missing coupon ID",
      "getCouponById",
      "",
      "warn"
    );
    return res.status(400).json({ error: "Coupon ID is required" });
  }

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      `Fetching coupon ${couponId}`,
      "getCouponById",
      "",
      "info"
    );

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });

    if (!coupon) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        `Coupon not found: ${couponId}`,
        "getCouponById",
        "",
        "warn"
      );
      return res.status(404).json({ error: "Coupon not found" });
    }

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Coupon fetched successfully",
      "getCouponById",
      JSON.stringify(coupon),
      "info"
    );

    res.status(200).json({
      message: "Coupon fetched successfully",
      data: coupon
    });

  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      `Error fetching coupon ${couponId}`,
      "getCouponById",
      JSON.stringify(error),
      "error"
    );
    return next(DbError.ErrorOfPrisma(error));
  }
};

/**
 * Controller to validate and apply a coupon
 */
export const validateCoupon = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { code, orderAmount, userId } = req.body;

  if (!childLogger) {
    return next(new Error("Internal Server Error: Logger not found."));
  }

  if (!code) {
    logWithMessageAndStep(
      childLogger,
      "Validation Error",
      "Missing coupon code",
      "validateCoupon",
      "",
      "warn"
    );
    return res.status(400).json({ error: "Coupon code is required" });
  }

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      `Validating coupon ${code}`,
      "validateCoupon",
      JSON.stringify({ code, orderAmount, userId }),
      "info"
    );

    const coupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (!coupon) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Coupon not found: ${code}`,
        "validateCoupon",
        "",
        "warn"
      );
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Coupon is inactive: ${code}`,
        "validateCoupon",
        "",
        "warn"
      );
      return res.status(400).json({ error: "Coupon is not active" });
    }

    // Check expiry date
    if (new Date(coupon.expiryDate) < new Date()) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Coupon expired: ${code}`,
        "validateCoupon",
        "",
        "warn"
      );
      return res.status(400).json({ error: "Coupon has expired" });
    }

    // Check max users
    if (coupon.usedCount >= coupon.maxUsers) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Coupon usage limit reached: ${code}`,
        "validateCoupon",
        "",
        "warn"
      );
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // Check if personal coupon matches user
    if (coupon.couponType === 'personal' && coupon.userId !== userId) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Personal coupon user mismatch: ${code}`,
        "validateCoupon",
        "",
        "warn"
      );
      return res.status(403).json({ error: "This coupon is not valid for your account" });
    }

    // Check minimum order amount
    if (orderAmount && coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Order amount too low for coupon: ${code}`,
        "validateCoupon",
        JSON.stringify({ orderAmount, minOrderAmount: coupon.minOrderAmount }),
        "warn"
      );
      return res.status(400).json({
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = orderAmount * (coupon.discountValue / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Coupon validated successfully",
      "validateCoupon",
      JSON.stringify(coupon),
      "info"
    );

    res.status(200).json({
      message: "Coupon is valid",
      data: {
        isValid: true,
        coupon,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    });

  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      `Error validating coupon ${code}`,
      "validateCoupon",
      JSON.stringify(error),
      "error"
    );
    return next(DbError.ErrorOfPrisma(error));
  }
};

/**
 * Controller to list all coupons with filtering options
 */
export const listCoupons = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;

  if (!childLogger) {
    return next(new Error("Internal Server Error: Logger not found."));
  }

  try {
    const {
      isActive,
      couponType,
      page = 1,
      limit = 10,
      userId
    } = req.query;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (couponType) {
      where.couponType = couponType;
    }

    if (userId) {
      where.userId = userId;
    }

    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Listing coupons with filters",
      "listCoupons",
      JSON.stringify(where),
      "info"
    );

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [coupons, totalCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.count({ where })
    ]);

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Coupons listed successfully",
      "listCoupons",
      JSON.stringify({ count: coupons.length, totalCount }),
      "info"
    );

    res.status(200).json({
      message: "Coupons fetched successfully",
      data: coupons,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / take),
        totalItems: totalCount
      }
    });

  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error listing coupons",
      "listCoupons",
      JSON.stringify(error),
      "error"
    );
    return next(DbError.ErrorOfPrisma(error));
  }
};

/**
 * Controller to delete a coupon (soft delete)
 */
export const deleteCoupon = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const couponId = req.params.id;

  if (!childLogger) {
    return next(new Error("Internal Server Error: Logger not found."));
  }

  if (!couponId) {
    logWithMessageAndStep(
      childLogger,
      "Validation Error",
      "Missing coupon ID",
      "deleteCoupon",
      "",
      "warn"
    );
    return res.status(400).json({ error: "Coupon ID is required" });
  }

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      `Deleting coupon ${couponId}`,
      "deleteCoupon",
      "",
      "info"
    );

    // First check if the coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });

    if (!coupon) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        `Coupon not found: ${couponId}`,
        "deleteCoupon",
        "",
        "warn"
      );
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Soft delete by setting isActive to false
    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Coupon deactivated successfully",
      "deleteCoupon",
      "",
      "info"
    );

    res.status(200).json({
      message: "Coupon deactivated successfully"
    });

  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      `Error deleting coupon ${couponId}`,
      "deleteCoupon",
      JSON.stringify(error),
      "error"
    );
    // Handle specific Prisma error for record not found
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update/delete not found
        return res.status(404).json({ error: "Coupon not found" });
      }
    }
    return next(DbError.ErrorOfPrisma(error));
  }
};

/**
 * Controller to record coupon usage
 */
export const recordCouponUsage = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { couponId, userId } = req.body; // userId is passed in body

  if (!childLogger) {
    return next(new Error("Internal Server Error: Logger not found."));
  }

  if (!couponId || !userId) {
    logWithMessageAndStep(
      childLogger,
      "Validation Error",
      "Missing coupon ID or user ID",
      "recordCouponUsage",
      "",
      "warn"
    );
    return res.status(400).json({ error: "Coupon ID and user ID are required" });
  }

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      `Recording coupon usage for ${couponId} by user ${userId}`,
      "recordCouponUsage",
      "",
      "info"
    );

    // First validate the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });

    if (!coupon) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Coupon not found: ${couponId}`,
        "recordCouponUsage",
        "",
        "warn"
      );
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Check if coupon can still be used (active and not expired)
    if (!coupon.isActive || new Date(coupon.expiryDate) < new Date()) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Coupon cannot be used (inactive or expired): ${couponId}`,
        "recordCouponUsage",
        "",
        "warn"
      );
      return res.status(400).json({ error: "Coupon is not active or has expired" });
    }

    // Check max users BEFORE checking individual usage to avoid race conditions if many users try to use the last slot
    if (coupon.usedCount >= coupon.maxUsers) {
        logWithMessageAndStep(
            childLogger,
            "Validation Error",
            `Coupon usage limit reached: ${couponId}`,
            "recordCouponUsage",
            "",
            "warn"
        );
        return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // Check if this is a personal coupon for another user
    if (coupon.couponType === 'personal' && coupon.userId !== userId) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `Personal coupon user mismatch: ${couponId}`,
        "recordCouponUsage",
        "",
        "warn"
      );
      return res.status(403).json({ error: "This coupon is not valid for your account" });
    }

    // Check if the user has already used this coupon (based on the unique constraint in CouponUsage)
    const existingUsage = await prisma.couponUsage.findUnique({
      where: {
        couponId_userId: { // This refers to the @@unique([couponId, userId]) compound index
          couponId: couponId,
          userId: userId,
        },
      },
    });

    if (existingUsage) {
      logWithMessageAndStep(
        childLogger,
        "Validation Error",
        `User ${userId} has already used coupon ${couponId}`,
        "recordCouponUsage",
        "",
        "warn"
      );
      return res.status(400).json({ error: "You have already used this coupon" });
    }

    // Use a Prisma transaction to ensure atomicity:
    // 1. Create CouponUsage record
    // 2. Increment usedCount in Coupon and update isActive if maxUsers is reached
    const [newCouponUsage, updatedCoupon] = await prisma.$transaction([
      prisma.couponUsage.create({
        data: {
          couponId: couponId,
          userId: userId,
        },
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: { increment: 1 },
          // Deactivate if max users reached after this increment
          isActive: coupon.usedCount + 1 < coupon.maxUsers ? true : false,
        },
      }),
    ]);


    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Coupon usage recorded successfully and coupon updated",
      "recordCouponUsage",
      `CouponUsage: ${JSON.stringify(newCouponUsage)}, UpdatedCoupon: ${JSON.stringify(updatedCoupon)}`,
      "info"
    );

    res.status(200).json({
      message: "Coupon usage recorded successfully",
      data: { couponUsage: newCouponUsage, updatedCoupon: updatedCoupon }
    });

  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      `Error recording coupon usage for ${couponId}`,
      "recordCouponUsage",
      JSON.stringify(error),
      "error"
    );
    return next(DbError.ErrorOfPrisma(error));
  }
};
