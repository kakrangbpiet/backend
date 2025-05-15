import express from "express";
import {
  bookMeeting,
  getMeetingById,
  getClientMeetings,
  getChildMeetings,
  updateMeetingStatus,
  rescheduleMeeting,
  cancelMeeting,
  getAllMeetings,
  deleteMeeting,
  updateMeetingDetails
} from "../../Controllers/Meetings/MeetingController.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router({ mergeParams: true });


/**
 * @swagger
 * /meetings:
 *   post:
 *     summary: Book a new meeting (can be parent or child meeting)
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - date
 *               - time
 *               - meetingType
 *               - topics
 *               - agreeTerms
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               meetingType:
 *                 type: string
 *                 enum: [support, sales, consultation, demo]
 *               topics:
 *                 type: string
 *               agreeTerms:
 *                 type: boolean
 *               parentMeetingId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Meeting booked successfully
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       500:
 *         description: Internal server error
 */
router.post("/meetings",
  checkJwt([ UserCategory.SUPER_ADMIN, UserCategory.GYS_USER, UserCategory.User]), 
  bookMeeting);

/**
 * @swagger
 * /meetings/{id}:
 *   get:
 *     summary: Get meeting by ID with optional child meetings
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *       - in: query
 *         name: includeChildren
 *         schema:
 *           type: boolean
 *         description: Whether to include child meetings
 *     responses:
 *       200:
 *         description: Meeting details
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Internal server error
 */
router.get("/meetings/:id",
  checkJwt([ UserCategory.SUPER_ADMIN, UserCategory.GYS_USER, UserCategory.User]), 
  getMeetingById);

/**
 * @swagger
 * /meetings/client:
 *   get:
 *     summary: Get all meetings for a client (by email or phone)
 *     tags: [Meetings]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Client email
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Client phone
 *       - in: query
 *         name: includeChildren
 *         schema:
 *           type: boolean
 *         description: Whether to include child meetings
 *     responses:
 *       200:
 *         description: List of client meetings
 *       400:
 *         description: Bad request - missing email or phone
 *       500:
 *         description: Internal server error
 */
router.get("/clientmeetings/client", 
  checkJwt([ UserCategory.SUPER_ADMIN, UserCategory.GYS_USER, UserCategory.User]), 
  getClientMeetings);

/**
 * @swagger
 * /meetings/parent/children/{parentId}:
 *   get:
 *     summary: Get all child meetings for a parent meeting
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Parent meeting ID
 *     responses:
 *       200:
 *         description: List of child meetings
 *       404:
 *         description: Parent meeting not found
 *       500:
 *         description: Internal server error
 */
router.get("/meetings/parent/children/:parentId",
  checkJwt([ UserCategory.SUPER_ADMIN, UserCategory.GYS_USER, UserCategory.User]), 
  getChildMeetings);

/**
 * @swagger
 * /meetings/status/{id}:
 *   patch:
 *     summary: Update meeting status (with option to update child meetings)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, canceled, rescheduled]
 *               updateChildren:
 *                 type: boolean
 *                 description: Whether to update all child meetings
 *     responses:
 *       200:
 *         description: Meeting status updated
 *       400:
 *         description: Bad request - invalid status
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/meetings/status/:id", 
  checkJwt([ UserCategory.SUPER_ADMIN]), 
  updateMeetingStatus);

/**
 * @swagger
 * /meetings/reschedule/{id}:
 *   patch:
 *     summary: Reschedule a meeting (with option to reschedule child meetings)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - time
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               rescheduleChildren:
 *                 type: boolean
 *               daysOffset:
 *                 type: number
 *                 description: Additional days to offset child meetings
 *     responses:
 *       200:
 *         description: Meeting rescheduled
 *       400:
 *         description: Bad request - invalid date/time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/meetings/reschedule", 
   checkJwt([ UserCategory.SUPER_ADMIN, UserCategory.GYS_USER, UserCategory.User]),  
  rescheduleMeeting);

/**
 * @swagger
 * /meetings/{id}/cancel:
 *   patch:
 *     summary: Cancel a meeting (with option to cancel child meetings)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelChildren:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Meeting canceled
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/meetings/cancel/:id", 
   checkJwt([ UserCategory.SUPER_ADMIN]),  
  cancelMeeting);

/**
 * @swagger
 * /meetings:
 *   get:
 *     summary: Get all meetings with pagination and filtering
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: meetingType
 *         schema:
 *           type: string
 *         description: Filter by meeting type
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meetings after this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meetings before this date
 *       - in: query
 *         name: includeChildren
 *         schema:
 *           type: boolean
 *         description: Include child meetings
 *       - in: query
 *         name: onlyParents
 *         schema:
 *           type: boolean
 *         description: Only return parent meetings
 *     responses:
 *       200:
 *         description: Paginated list of meetings
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/meetings", 
   checkJwt([ UserCategory.SUPER_ADMIN, UserCategory.GYS_USER, UserCategory.User]),  
  getAllMeetings);

/**
 * @swagger
 * /meetings/{id}:
 *   delete:
 *     summary: Delete a meeting (with option to delete child meetings)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *       - in: query
 *         name: deleteChildren
 *         schema:
 *           type: boolean
 *         description: Whether to delete child meetings
 *     responses:
 *       200:
 *         description: Meeting deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Internal server error
 */
router.delete("/meetings/:id", 
    checkJwt([ UserCategory.SUPER_ADMIN]), 
  deleteMeeting);

/**
 * @swagger
 * /meetings/details/{id}:
 *   patch:
 *     summary: Update meeting details (notes, status)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, canceled, rescheduled]
 *     responses:
 *       200:
 *         description: Meeting details updated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/meetings/details/:id", 
   checkJwt([ UserCategory.SUPER_ADMIN]),  
  updateMeetingDetails);

export default router;