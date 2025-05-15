import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
import { RequestWithUser } from "src/Middleware/checkJwt.js";

/**
 * Book a new meeting (can be parent or child meeting)
 */
export const bookMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const meetingData = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Booking new meeting",
      "bookMeeting",
      JSON.stringify(meetingData),
      "info"
    );

    // Validate required fields
    const requiredFields = ['name', 'email', 'phoneNumber', 'date', 'time', 'meetingType', 'topics', 'agreeTerms'];
    const missingFields = requiredFields.filter(field => !meetingData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate agreeTerms is true
    if (meetingData.agreeTerms !== true) {
      return res.status(400).json({
        error: "You must agree to the terms and conditions"
      });
    }

    // Validate meeting type
    const validMeetingTypes = ["support", "sales", "consultation", "demo"];
    if (!validMeetingTypes.includes(meetingData.meetingType)) {
      return res.status(400).json({
        error: `Invalid meeting type. Must be one of: ${validMeetingTypes.join(", ")}`
      });
    }

    // Combine date and time into a single datetime
    const meetingDateTime = new Date(`${meetingData.date}T${meetingData.time}`);
    
    // Check if the meeting time is in the future
    if (meetingDateTime < new Date()) {
      return res.status(400).json({
        error: "Meeting time must be in the future"
      });
    }

    // Validate parent meeting exists if provided
    if (meetingData.parentMeetingId) {
      const parentMeeting = await prisma.meeting.findUnique({
        where: { id: meetingData.parentMeetingId }
      });
      
      if (!parentMeeting) {
        return res.status(404).json({
          error: "Parent meeting not found"
        });
      }
    }

    // Create the meeting
    const newMeeting = await prisma.meeting.create({
      data: {
        name: meetingData.name,
        email: meetingData.email,
        phoneNumber: meetingData.phoneNumber,
        meetingDateTime: meetingDateTime,
        meetingType: meetingData.meetingType,
        topics: meetingData.topics,
        agreeTerms: meetingData.agreeTerms,
        status: "scheduled",
        parentMeetingId: meetingData.parentMeetingId || null,
        notes: meetingData.notes || null
      },
      include: {
        childMeetings: true
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully booked meeting",
      "bookMeeting",
      `Created meeting with ID: ${newMeeting.id}`,
      "info"
    );

    res.status(201).json({
      data: newMeeting,
      message: meetingData.parentMeetingId 
        ? "Follow-up meeting booked successfully" 
        : "Meeting booked successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error booking meeting",
      "bookMeeting",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get meeting by ID with child meetings
 */
export const getMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { includeChildren } = req.query;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching meeting by ID",
      "getMeetingById",
      `ID: ${id}`,
      "info"
    );

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        childMeetings: includeChildren === 'true',
        parentMeeting: includeChildren === 'true'
      }
    });

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found"
      });
    }

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched meeting",
      "getMeetingById",
      `Found meeting with ID: ${id}`,
      "info"
    );

    res.status(200).json({
      data: meeting,
      message: "Meeting fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching meeting",
      "getMeetingById",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get all meetings for a client (by email or phoneNumber) with optional child meetings
 */
export const getClientMeetings = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const  phoneNumber = req.user?.phoneNumber;
  const  email = req.user?.email;
  const { includeChildren } = req.query;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching client meetings",
      "getClientMeetings",
      `Email: ${email}, PhoneNumber: ${phoneNumber}`,
      "info"
    );

    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Either email or phoneNumber must be provided"
      });
    }

    const where: any = {};
    if (email) where.email = email as string;
    if (phoneNumber) where.phoneNumber = phoneNumber as string;

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        childMeetings: includeChildren === 'true'
      },
      orderBy: {
        meetingDateTime: 'desc'
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched client meetings",
      "getClientMeetings",
      `Found ${meetings.length} meetings`,
      "info"
    );

    res.status(200).json({
      data: meetings,
      message: "Client meetings fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching client meetings",
      "getClientMeetings",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get all child meetings for a parent meeting
 */
export const getChildMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { parentId } = req.params;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching child meetings",
      "getChildMeetings",
      `Parent ID: ${parentId}`,
      "info"
    );

    const parentMeeting = await prisma.meeting.findUnique({
      where: { id: parentId }
    });

    if (!parentMeeting) {
      return res.status(404).json({
        error: "Parent meeting not found"
      });
    }

    const childMeetings = await prisma.meeting.findMany({
      where: { parentMeetingId: parentId },
      orderBy: {
        meetingDateTime: 'asc'
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched child meetings",
      "getChildMeetings",
      `Found ${childMeetings.length} child meetings for parent ${parentId}`,
      "info"
    );

    res.status(200).json({
      data: childMeetings,
      message: "Child meetings fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching child meetings",
      "getChildMeetings",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Update meeting status (handles parent and child meetings)
 */
export const updateMeetingStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const childLogger = (req as any).childLogger as winston.Logger;
    const { id } = req.params;
    const { status, updateChildren } = req.body;
  
    try {
      logWithMessageAndStep(
        childLogger,
        "Step 1",
        "Updating meeting status",
        "updateMeetingStatus",
        `ID: ${id}, New Status: ${status}, Update Children: ${updateChildren}`,
        "info"
      );
  
      if (!status) {
        return res.status(400).json({
          error: "Status is required in request body"
        });
      }
  
      const validStatuses = ["scheduled", "completed", "canceled", "rescheduled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        });
      }
  
      // First update the parent meeting
      const updatedMeeting = await prisma.meeting.update({
        where: { id },
        data: { status }
      });
  
      // Optionally update all child meetings
      if (updateChildren === true) {
        await prisma.meeting.updateMany({
          where: { parentMeetingId: id },
          data: { status }
        });
      }
  
      logWithMessageAndStep(
        childLogger,
        "Step 2",
        "Successfully updated meeting status",
        "updateMeetingStatus",
        `Updated meeting ID: ${id} to status: ${status}`,
        "info"
      );
  
      res.status(200).json({
        data: {
          ...updatedMeeting,
          childrenUpdated: updateChildren === true
        },
        message: "Meeting status updated successfully"
      });
    } catch (error) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        "Error updating meeting status",
        "updateMeetingStatus",
        JSON.stringify(error),
        "error"
      );
      next(error);
    }
  };
  
  /**
   * Reschedule a meeting (handles parent and optional child meetings)
   */
  export const rescheduleMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const childLogger = (req as any).childLogger as winston.Logger;
    const { id } = req.params;
    const { date, time, rescheduleChildren, daysOffset } = req.body;
  
    try {
      logWithMessageAndStep(
        childLogger,
        "Step 1",
        "Rescheduling meeting",
        "rescheduleMeeting",
        `ID: ${id}, New Date: ${date}, New Time: ${time}`,
        "info"
      );
  
      if (!date || !time) {
        return res.status(400).json({
          error: "Both date and time are required to reschedule"
        });
      }
  
      // Combine date and time into a single datetime
      const newMeetingDateTime = new Date(`${date}T${time}`);
      
      // Check if the new meeting time is in the future
      if (newMeetingDateTime < new Date()) {
        return res.status(400).json({
          error: "New meeting time must be in the future"
        });
      }
  
      // First update the parent meeting
      const updatedMeeting = await prisma.meeting.update({
        where: { id },
        data: { 
          meetingDateTime: newMeetingDateTime,
          status: "rescheduled"
        }
      });
  
      // Optionally reschedule all child meetings with the same offset
      let childrenUpdated = 0;
      if (rescheduleChildren === true && daysOffset) {
        const childMeetings = await prisma.meeting.findMany({
          where: { parentMeetingId: id }
        });
  
        for (const child of childMeetings) {
          const originalDiff = child.meetingDateTime.getTime() - updatedMeeting.meetingDateTime.getTime();
          const newChildDate = new Date(newMeetingDateTime.getTime() + originalDiff);
          
          // Apply additional days offset if specified
          if (daysOffset) {
            newChildDate.setDate(newChildDate.getDate() + daysOffset);
          }
  
          await prisma.meeting.update({
            where: { id: child.id },
            data: {
              meetingDateTime: newChildDate,
              status: "rescheduled"
            }
          });
          childrenUpdated++;
        }
      }
  
      logWithMessageAndStep(
        childLogger,
        "Step 2",
        "Successfully rescheduled meeting",
        "rescheduleMeeting",
        `Rescheduled meeting ID: ${id} to ${newMeetingDateTime}`,
        "info"
      );
  
      res.status(200).json({
        data: {
          ...updatedMeeting,
          childrenUpdated,
          newDateTime: newMeetingDateTime
        },
        message: "Meeting rescheduled successfully"
      });
    } catch (error) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        "Error rescheduling meeting",
        "rescheduleMeeting",
        JSON.stringify(error),
        "error"
      );
      next(error);
    }
  };
  
  /**
   * Cancel a meeting (with option to cancel child meetings)
   */
  export const cancelMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const childLogger = (req as any).childLogger as winston.Logger;
    const { id } = req.params;
    const { cancelChildren } = req.body;
  
    try {
      logWithMessageAndStep(
        childLogger,
        "Step 1",
        "Canceling meeting",
        "cancelMeeting",
        `ID: ${id}, Cancel Children: ${cancelChildren}`,
        "info"
      );
  
      // First cancel the parent meeting
      const canceledMeeting = await prisma.meeting.update({
        where: { id },
        data: { status: "canceled" }
      });
  
      // Optionally cancel all child meetings
      let childrenCanceled = 0;
      if (cancelChildren === true) {
        const result = await prisma.meeting.updateMany({
          where: { parentMeetingId: id },
          data: { status: "canceled" }
        });
        childrenCanceled = result.count;
      }
  
      logWithMessageAndStep(
        childLogger,
        "Step 2",
        "Successfully canceled meeting",
        "cancelMeeting",
        `Canceled meeting with ID: ${id}`,
        "info"
      );
  
      res.status(200).json({
        data: {
          ...canceledMeeting,
          childrenCanceled
        },
        message: "Meeting canceled successfully"
      });
    } catch (error) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        "Error canceling meeting",
        "cancelMeeting",
        JSON.stringify(error),
        "error"
      );
      next(error);
    }
  };
  
  /**
   * Get all meetings with pagination, filtering, and child meeting options
   */
  export const getAllMeetings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const childLogger = (req as any).childLogger as winston.Logger;
  
    try {
      logWithMessageAndStep(
        childLogger,
        "Step 1",
        "Fetching all meetings",
        "getAllMeetings",
        "",
        "info"
      );
  
      // Get pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const skip = (page - 1) * pageSize;
  
      // Get filter parameters
      const status = req.query.status as string | undefined;
      const meetingType = req.query.meetingType as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const includeChildren = req.query.includeChildren === 'true';
      const onlyParents = req.query.onlyParents === 'true';
  
      // Build where clause
      const where: any = {};
      if (status) where.status = status;
      if (meetingType) where.meetingType = meetingType;
      if (onlyParents) where.parentMeetingId = null;
      
      if (dateFrom || dateTo) {
        where.meetingDateTime = {};
        if (dateFrom) where.meetingDateTime.gte = new Date(dateFrom);
        if (dateTo) where.meetingDateTime.lte = new Date(dateTo);
      }
  
      // Get total count for pagination metadata
      const totalCount = await prisma.meeting.count({ where });
  
      const meetings = await prisma.meeting.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          childMeetings: includeChildren
        },
        orderBy: {
          meetingDateTime: "asc"
        }
      });
  
      logWithMessageAndStep(
        childLogger,
        "Step 2",
        "Successfully fetched meetings",
        "getAllMeetings",
        `Found ${meetings.length} meetings`,
        "info"
      );
  
      res.status(200).json({
        data: meetings,
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        message: "Meetings fetched successfully"
      });
    } catch (error) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        "Error fetching meetings",
        "getAllMeetings",
        JSON.stringify(error),
        "error"
      );
      next(error);
    }
  };
  
  /**
   * Delete a meeting (with option to delete child meetings)
   */
  export const deleteMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const childLogger = (req as any).childLogger as winston.Logger;
    const { id } = req.params;
    const { deleteChildren } = req.query;
  
    try {
      logWithMessageAndStep(
        childLogger,
        "Step 1",
        "Deleting meeting",
        "deleteMeeting",
        `ID: ${id}, Delete Children: ${deleteChildren}`,
        "info"
      );
  
      // First check if meeting exists
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: {
          childMeetings: deleteChildren === 'true'
        }
      });
  
      if (!meeting) {
        return res.status(404).json({
          error: "Meeting not found"
        });
      }
  
      // Optionally delete child meetings first
      if (deleteChildren === 'true' && meeting.childMeetings.length > 0) {
        await prisma.meeting.deleteMany({
          where: { parentMeetingId: id }
        });
      }
  
      // Then delete the parent meeting
      await prisma.meeting.delete({
        where: { id }
      });
  
      logWithMessageAndStep(
        childLogger,
        "Step 2",
        "Successfully deleted meeting",
        "deleteMeeting",
        `Deleted meeting with ID: ${id}`,
        "info"
      );
  
      res.status(200).json({
        message: "Meeting deleted successfully",
        childrenDeleted: deleteChildren === 'true' ? meeting.childMeetings.length : 0
      });
    } catch (error) {
      logWithMessageAndStep(
        childLogger,
        "Error Step",
        "Error deleting meeting",
        "deleteMeeting",
        JSON.stringify(error),
        "error"
      );
      next(error);
    }
  };
/**
 * Update meeting to add notes or other details
 */
export const updateMeetingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { notes, status } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Updating meeting details",
      "updateMeetingDetails",
      `ID: ${id}`,
      "info"
    );

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        notes,
        ...(status && { status }) // Only update status if provided
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated meeting details",
      "updateMeetingDetails",
      `Updated meeting ID: ${id}`,
      "info"
    );

    res.status(200).json({
      data: updatedMeeting,
      message: "Meeting details updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating meeting details",
      "updateMeetingDetails",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};