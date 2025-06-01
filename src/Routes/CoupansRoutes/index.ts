import express from "express";
import {
  createCoupon,
  updateCoupon,
  getCouponById,
  validateCoupon,
  listCoupons,
  deleteCoupon,
  recordCouponUsage,
} from "../../Controllers/Travel/Coupans/index.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router();

/**
 * @swagger
 * /coupons:
 * post:
 * summary: Create a new coupon
 * tags: [Coupons]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - code
 * - expiryDate
 * - couponType
 * - discountType
 * - discountValue
 * - maxUsers
 * properties:
 * name:
 * type: string
 * description: Name of the coupon
 * description:
 * type: string
 * description: Description of the coupon
 * logo:
 * type: string
 * description: URL to coupon logo
 * code:
 * type: string
 * description: Unique coupon code
 * maxUsers:
 * type: integer
 * description: Maximum number of users who can use this coupon
 * expiryDate:
 * type: string
 * format: date-time
 * description: Expiry date of the coupon
 * couponType:
 * type: string
 * enum: [website, personal]
 * description: Type of coupon (website-wide or personal)
 * discountType:
 * type: string
 * enum: [percentage, fixed]
 * description: Type of discount
 * discountValue:
 * type: number
 * description: Discount value (percentage or fixed amount)
 * minOrderAmount:
 * type: number
 * description: Minimum order amount required to use this coupon
 * status:
 * type: boolean
 * description: Whether the coupon is active (changed from string to boolean)
 * responses:
 * 201:
 * description: Coupon created successfully
 * 400:
 * description: Invalid input data
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (insufficient permissions)
 * 500:
 * description: Internal server error
 */
router.post("/coupons", checkJwt([UserCategory.SUPER_ADMIN]), createCoupon);

/**
 * @swagger
 * /coupons/{id}:
 * patch:
 * summary: Update a coupon
 * tags: [Coupons]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: Coupon ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * description:
 * type: string
 * logo:
 * type: string
 * maxUsers:
 * type: integer
 * expiryDate:
 * type: string
 * format: date-time
 * isActive:
 * type: boolean
 * minOrderAmount:
 * type: number
 * responses:
 * 200:
 * description: Coupon updated successfully
 * 400:
 * description: Invalid input data
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (insufficient permissions)
 * 404:
 * description: Coupon not found
 * 500:
 * description: Internal server error
 */
router.patch("/coupons/:id", checkJwt([UserCategory.SUPER_ADMIN]), updateCoupon);

/**
 * @swagger
 * /coupons/{id}:
 * get:
 * summary: Get a coupon by ID
 * tags: [Coupons]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: Coupon ID
 * responses:
 * 200:
 * description: Coupon details
 * 400:
 * description: Invalid coupon ID
 * 401:
 * description: Unauthorized
 * 404:
 * description: Coupon not found
 * 500:
 * description: Internal server error
 */
router.get("/coupons/:id", getCouponById);

/**
 * @swagger
 * /coupons/validate:
 * post:
 * summary: Validate a coupon
 * tags: [Coupons]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - code
 * properties:
 * code:
 * type: string
 * description: Coupon code to validate
 * orderAmount:
 * type: number
 * description: Order amount to validate against minimum order amount
 * userId:
 * type: string
 * description: User ID for personal coupon validation
 * responses:
 * 200:
 * description: Coupon validation result
 * 400:
 * description: Invalid coupon code or validation failed
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (personal coupon mismatch)
 * 404:
 * description: Coupon not found
 * 500:
 * description: Internal server error
 */
router.post("/coupons/validate", validateCoupon);

/**
 * @swagger
 * /coupons:
 * get:
 * summary: List all coupons with filtering options
 * tags: [Coupons]
 * parameters:
 * - in: query
 * name: isActive
 * schema:
 * type: boolean
 * description: Filter by active status
 * - in: query
 * name: couponType
 * schema:
 * type: string
 * enum: [website, personal]
 * description: Filter by coupon type
 * - in: query
 * name: page
 * schema:
 * type: integer
 * default: 1
 * description: Page number for pagination
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 10
 * description: Number of items per page
 * - in: query
 * name: userId
 * schema:
 * type: string
 * description: Filter personal coupons by user ID
 * responses:
 * 200:
 * description: List of coupons with pagination info
 * 401:
 * description: Unauthorized
 * 500:
 * description: Internal server error
 */
router.get("/coupons", listCoupons);

/**
 * @swagger
 * /coupons/{id}:
 * delete:
 * summary: Delete (deactivate) a coupon
 * tags: [Coupons]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: Coupon ID
 * responses:
 * 200:
 * description: Coupon deactivated successfully
 * 400:
 * description: Invalid coupon ID
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (insufficient permissions)
 * 404:
 * description: Coupon not found
 * 500:
 * description: Internal server error
 */
router.delete("/coupons/:id", checkJwt([UserCategory.SUPER_ADMIN]), deleteCoupon);

/**
 * @swagger
 * /coupons/usage:
 * post:
 * summary: Record coupon usage
 * tags: [Coupons]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - couponId
 * - userId
 * properties:
 * couponId:
 * type: string
 * description: Coupon ID being used
 * userId:
 * type: string
 * description: User ID using the coupon
 * responses:
 * 200:
 * description: Coupon usage recorded successfully
 * 400:
 * description: Invalid input or coupon cannot be used, or user has already used this coupon
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (personal coupon mismatch)
 * 404:
 * description: Coupon not found
 * 500:
 * description: Internal server error
 */
router.post("/coupons/usage", checkJwt([UserCategory.SUPER_ADMIN]), recordCouponUsage);

export default router;
