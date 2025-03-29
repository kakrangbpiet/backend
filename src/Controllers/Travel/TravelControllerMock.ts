import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";

// Mock data for travel items
const mockTravelItems = [
  {
    id: "cln4a9p6r0000q8jq9q9q9q9q",
    name: "Beach Paradise Vacation",
    description: "7-day luxury beach getaway with all-inclusive amenities",
    type: "vacation",
    category: "beach",
    price: 1499.99,
    location: "Maldives",
    country: "Maldives",
    city: "Malé",
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "https://example.com/images/maldives-beach.jpg",
    isFeatured: true,
    isActive: true,
    createdAt: "2023-06-15T00:00:00Z",
    updatedAt: "2023-06-15T00:00:00Z"
  },
  {
    id: "cln4a9p6r0001q8jq9q9q9q9q",
    name: "Mountain Trekking Adventure",
    description: "5-day guided trek through the Himalayas",
    type: "adventure",
    category: "mountain",
    price: 899.99,
    location: "Everest Base Camp",
    country: "Nepal",
    city: "Kathmandu",
    rating: 4.6,
    reviewCount: 89,
    imageUrl: "https://example.com/images/everest-trek.jpg",
    isFeatured: true,
    isActive: true,
    createdAt: "2023-05-20T00:00:00Z",
    updatedAt: "2023-05-22T00:00:00Z"
  },
  {
    id: "cln4a9p6r0002q8jq9q9q9q9q",
    name: "European City Explorer",
    description: "10-day tour of major European capitals",
    type: "vacation",
    category: "city",
    price: 2199.99,
    location: "Multiple Cities",
    country: "Various",
    city: "Various",
    rating: 4.7,
    reviewCount: 156,
    imageUrl: "https://example.com/images/europe-tour.jpg",
    isFeatured: false,
    isActive: true,
    createdAt: "2023-04-10T00:00:00Z",
    updatedAt: "2023-04-12T00:00:00Z"
  },
  {
    id: "cln4a9p6r0003q8jq9q9q9q9q",
    name: "Business Class Conference Package",
    description: "3-day business trip package with premium accommodations",
    type: "business",
    category: "city",
    price: 799.99,
    location: "New York",
    country: "USA",
    city: "New York",
    rating: 4.3,
    reviewCount: 42,
    imageUrl: "https://example.com/images/nyc-business.jpg",
    isFeatured: false,
    isActive: true,
    createdAt: "2023-07-05T00:00:00Z",
    updatedAt: "2023-07-05T00:00:00Z"
  },
  {
    id: "cln4a9p6r0004q8jq9q9q9q9q",
    name: "Desert Safari Experience",
    description: "2-day authentic desert camping and safari",
    type: "adventure",
    category: "desert",
    price: 349.99,
    location: "Dubai Desert",
    country: "UAE",
    city: "Dubai",
    rating: 4.5,
    reviewCount: 67,
    imageUrl: "https://example.com/images/dubai-safari.jpg",
    isFeatured: true,
    isActive: true,
    createdAt: "2023-08-12T00:00:00Z",
    updatedAt: "2023-08-15T00:00:00Z"
  }
];

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

        // In a real implementation, you would use Prisma:
        // const travelItems = await prisma.travelItem.findMany({...});
        
        // For mock implementation:
        const travelItems = mockTravelItems;

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

        // In a real implementation, you would use Prisma:
        // const travelItems = await prisma.travelItem.findMany({
        //   where: { category: String(category) }
        // });
        
        // For mock implementation:
        const travelItems = mockTravelItems.filter(
            item => item.category.toLowerCase() === String(category).toLowerCase()
        );

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