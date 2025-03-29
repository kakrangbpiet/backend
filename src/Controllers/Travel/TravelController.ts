import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";

/**
 * Get all travel items by type
 */
export const getTravelItemsByType = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Fetching travel items by type",
            "getTravelItemsByType",
            "",
            "info"
        );

        const travelItems = await prisma.travelItem.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                category: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            "Successfully fetched travel items by type",
            "getTravelItemsByType",
            `Found ${travelItems.length} items`,
            "info"
        );

        res.status(200).json({
            data: travelItems,
            message: "Travel items fetched successfully"
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error fetching travel items by type",
            "getTravelItemsByType",
            JSON.stringify(error),
            "error"
        );
        next(error);
    }
};

/**
 * Get travel items by category
 */
export const getTravelItemsByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;
    const { category } = req.query;

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Fetching travel items by category",
            "getTravelItemsByCategory",
            `Category: ${category}`,
            "info"
        );

        if (!category) {
            return res.status(400).json({
                error: "Category query parameter is required"
            });
        }

        const travelItems = await prisma.travelItem.findMany({
            where: {
                category: String(category)
            },
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                category: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            "Successfully fetched travel items by category",
            "getTravelItemsByCategory",
            `Found ${travelItems.length} items for category ${category}`,
            "info"
        );

        res.status(200).json({
            data: travelItems,
            message: `Travel items for category ${category} fetched successfully`
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error fetching travel items by category",
            "getTravelItemsByCategory",
            JSON.stringify(error),
            "error"
        );
        next(error);
    }
};