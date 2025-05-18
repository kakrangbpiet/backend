import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { prisma } from "../../Utils/db/client.js";
import { logWithMessageAndStep } from "../../Utils/Logger/logger.js";
import { RequestWithUser } from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

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
    const requiredFields = ['name', 'email', 'phoneNumber', 'meetingDateTime', 'meetingType', 'topics', 'agreeTerms'];
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

    // Check if the meeting time is in the future
    const meetingDateTime = new Date(meetingData.meetingDateTime);
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
        parentMeetingId: meetingData.parentMeetingId || null
      },
      include: {
        childMeetings: true,
        parentMeeting: true
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
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { includeChildren, includeNotes } = req.query;
  const phoneNumber = req.user?.phoneNumber;
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
        parentMeeting: includeChildren === 'true',
        notes: includeNotes === 'true'
      }
    });

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found"
      });
    }
    const isOwner = meeting.phoneNumber === phoneNumber;
    const isAdmin = req.user?.category === UserCategory.SUPER_ADMIN;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You are not authorized for this"
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
  const phoneNumber = req.user?.phoneNumber;
  const email = req.user?.email;
  const { includeChildren, includeNotes } = req.query;

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
        childMeetings: includeChildren === 'true',
        notes: includeNotes === 'true'
      },
      orderBy: {
        meetingDateTime: 'asc'
      }
    });
    const isOwner = meetings[0].phoneNumber === phoneNumber;
    const isAdmin = req.user?.category === UserCategory.SUPER_ADMIN;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You are not authorized for this"
      });
    }
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
    let childrenUpdated = 0;
    if (updateChildren === true) {
      const result = await prisma.meeting.updateMany({
        where: { parentMeetingId: id },
        data: { status }
      });
      childrenUpdated = result.count;
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
        childrenUpdated
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
  const { newDateTime, rescheduleChildren, daysOffset } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Rescheduling meeting",
      "rescheduleMeeting",
      `ID: ${id}, New DateTime: ${newDateTime}`,
      "info"
    );

    if (!newDateTime) {
      return res.status(400).json({
        error: "newDateTime is required to reschedule"
      });
    }

    const meetingDateTime = new Date(newDateTime);
    
    // Check if the new meeting time is in the future
    if (meetingDateTime < new Date()) {
      return res.status(400).json({
        error: "New meeting time must be in the future"
      });
    }

    // First update the parent meeting
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: { 
        meetingDateTime: meetingDateTime,
        status: "rescheduled"
      }
    });

    // Optionally reschedule all child meetings with the same offset
    let childrenUpdated = 0;
    if (rescheduleChildren === true) {
      const childMeetings = await prisma.meeting.findMany({
        where: { parentMeetingId: id }
      });

      for (const child of childMeetings) {
        const originalDiff = child.meetingDateTime.getTime() - updatedMeeting.meetingDateTime.getTime();
        const newChildDate = new Date(meetingDateTime.getTime() + originalDiff);
        
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
      `Rescheduled meeting ID: ${id} to ${meetingDateTime}`,
      "info"
    );

    res.status(200).json({
      data: {
        ...updatedMeeting,
        childrenUpdated,
        newDateTime: meetingDateTime
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
  const { cancelChildren, cancellationReason } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Canceling meeting",
      "cancelMeeting",
      `ID: ${id}, Cancel Children: ${cancelChildren}`,
      "info"
    );

    // Create a cancellation note
    const noteContent = `Meeting canceled${cancellationReason ? `. Reason: ${cancellationReason}` : ''}`;

    // First cancel the parent meeting
    const canceledMeeting = await prisma.meeting.update({
      where: { id },
      data: { 
        status: "canceled",
        notes: {
          create: {
            content: noteContent
          }
        }
      }
    });

    // Optionally cancel all child meetings
    let childrenCanceled = 0;
    if (cancelChildren === true) {
      const result = await prisma.meeting.updateMany({
        where: { parentMeetingId: id },
        data: { 
          status: "canceled",
        }
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
    const email = req.query.email as string | undefined;
    const phoneNumber = req.query.phoneNumber as string | undefined;
    const includeNotes = req.query.includeNotes === 'true';

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (meetingType) where.meetingType = meetingType;
    if (email) where.email = email;
    if (phoneNumber) where.phoneNumber = phoneNumber;
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
        childMeetings: includeChildren,
        notes: includeNotes,
        parentMeeting: includeChildren
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
        childMeetings: deleteChildren === 'true',
        notes: true
      }
    });

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found"
      });
    }

    // Delete all notes first (required due to foreign key constraint)
    if (meeting.notes.length > 0) {
      await prisma.meetingNote.deleteMany({
        where: { meetingId: id }
      });
    }

    // Optionally delete child meetings first
    let childrenDeleted = 0;
    if (deleteChildren === 'true' && meeting.childMeetings.length > 0) {
      // Delete all child meeting notes first
      await prisma.meetingNote.deleteMany({
        where: { meetingId: { in: meeting.childMeetings.map(c => c.id) } }
      });

      const result = await prisma.meeting.deleteMany({
        where: { parentMeetingId: id }
      });
      childrenDeleted = result.count;
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
      childrenDeleted,
      notesDeleted: meeting.notes.length
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

/**
 * Add notes to a meeting
 */
export const addNotesToMeeting = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const { content } = req.body;
  const phoneNumber=req.user?.phoneNumber;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Adding notes to meeting",
      "addNotesToMeeting",
      `Meeting ID: ${id}, Note: ${content?.substring(0, 20)}...`,
      "info"
    );

    if (!content) {
      return res.status(400).json({
        error: "Note content is required"
      });
    }

    // Get the current meeting to check if it exists
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found"
      });
    }
     // Verify that either:
    // 1. The meeting's phoneNumber matches the user's phoneNumber (owner), OR
    // 2. The user is a SUPER_ADMIN
    const isOwner = meeting.phoneNumber === phoneNumber;
    const isAdmin = req.user?.category === UserCategory.SUPER_ADMIN;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You are not authorized to add notes to this meeting"
      });
    }


    // Create a new note
    const newNote = await prisma.meetingNote.create({
      data: {
        content,
        meetingId: id,
        authorId: req.user?.id || "system"
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully added note to meeting",
      "addNotesToMeeting",
      `Added note with ID: ${newNote.id} to meeting ${id}`,
      "info"
    );

    res.status(201).json({
      data: newNote,
      message: "Note added successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error adding note to meeting",
      "addNotesToMeeting",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Get all notes for a meeting
 */
export const getMeetingNotes = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id } = req.params;
  const phoneNumber = req.user?.phoneNumber;
  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Fetching meeting notes",
      "getMeetingNotes",
      `Meeting ID: ${id}`,
      "info"
    );

    // First check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found"
      });
    }
     // Verify that either:
    // 1. The meeting's phoneNumber matches the user's phoneNumber (owner), OR
    // 2. The user is a SUPER_ADMIN
    const isOwner = meeting.phoneNumber === phoneNumber;
    const isAdmin = req.user?.category === UserCategory.SUPER_ADMIN;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You are not authorized to add notes to this meeting"
      });
    }


    // Get all notes for this meeting
    const notes = await prisma.meetingNote.findMany({
      where: { meetingId: id },
      orderBy: {
        createdAt: 'desc'
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully fetched meeting notes",
      "getMeetingNotes",
      `Found ${notes.length} notes for meeting ${id}`,
      "info"
    );

    res.status(200).json({
      data: notes,
      message: "Meeting notes fetched successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error fetching meeting notes",
      "getMeetingNotes",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Update a meeting note
 */
export const updateMeetingNote = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id, noteId } = req.params;
  const { content } = req.body;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Updating meeting note",
      "updateMeetingNote",
      `Meeting ID: ${id}, Note ID: ${noteId}`,
      "info"
    );

    if (!content) {
      return res.status(400).json({
        error: "Note content is required"
      });
    }

    // First check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found"
      });
    }

    // Update the note
    const updatedNote = await prisma.meetingNote.update({
      where: { id: noteId },
      data: {
        content,
        updatedAt: new Date()
      }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully updated meeting note",
      "updateMeetingNote",
      `Updated note ID: ${noteId}`,
      "info"
    );

    res.status(200).json({
      data: updatedNote,
      message: "Note updated successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error updating meeting note",
      "updateMeetingNote",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};

/**
 * Delete a meeting note
 */
export const deleteMeetingNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const childLogger = (req as any).childLogger as winston.Logger;
  const { id, noteId } = req.params;

  try {
    logWithMessageAndStep(
      childLogger,
      "Step 1",
      "Deleting meeting note",
      "deleteMeetingNote",
      `Meeting ID: ${id}, Note ID: ${noteId}`,
      "info"
    );

    // First check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found"
      });
    }

    // Delete the note
    await prisma.meetingNote.delete({
      where: { id: noteId }
    });

    logWithMessageAndStep(
      childLogger,
      "Step 2",
      "Successfully deleted meeting note",
      "deleteMeetingNote",
      `Deleted note ID: ${noteId}`,
      "info"
    );

    res.status(200).json({
      message: "Note deleted successfully"
    });
  } catch (error) {
    logWithMessageAndStep(
      childLogger,
      "Error Step",
      "Error deleting meeting note",
      "deleteMeetingNote",
      JSON.stringify(error),
      "error"
    );
    next(error);
  }
};