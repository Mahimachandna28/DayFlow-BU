import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth";

const GEO_PROFILES: Record<
  string,
  { label: string; distanceKm: number | null; remarks: string }
> = {
  office: {
    label: "At Office HQ",
    distanceKm: 0.03,
    remarks: "HQ verified check-in",
  },
  remote: {
    label: "Remote / Out of Bounds",
    distanceKm: 5.4,
    remarks: "[Geo Breach] Outside company perimeter - 5.4 km from HQ",
  },
  blocked: {
    label: "Disabled / Denied",
    distanceKm: null,
    remarks: "[GPS Warning] Location sensor unavailable or permission denied",
  },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export async function getAttendance(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { role, id } = req.user;
    let records;

    if (role === "ADMIN" || role === "HR_OFFICER") {
      records = await prisma.attendanceRecord.findMany({
        orderBy: { date: "desc" },
      });
    } else {
      records = await prisma.attendanceRecord.findMany({
        where: { userId: id },
        orderBy: { date: "desc" },
      });
    }

    res.json({ success: true, records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve attendance logs" });
  }
}

export async function getActiveSession(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    let session = await prisma.activeSession.findUnique({
      where: { userId: req.user.id },
    });

    if (!session) {
      // Create a default inactive session if none exists
      session = await prisma.activeSession.create({
        data: {
          userId: req.user.id,
          isActive: false,
          startTime: null,
          elapsedSeconds: 0,
          isOnBreak: false,
          breakStartTime: null,
          totalBreakSeconds: 0,
          locationStatus: "office",
          geoDistanceKm: 0.03,
        },
      });
    }

    // Format fields to match frontend expectation (converting String timestamps to numbers or null)
    const formattedSession = {
      isActive: session.isActive,
      startTime: session.startTime ? Number(session.startTime) : null,
      elapsedSeconds: session.elapsedSeconds,
      isOnBreak: session.isOnBreak,
      breakStartTime: session.breakStartTime ? Number(session.breakStartTime) : null,
      totalBreakSeconds: session.totalBreakSeconds,
      locationStatus: session.locationStatus,
      geoDistanceKm: session.geoDistanceKm,
    };

    res.json({ success: true, session: formattedSession });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve active session" });
  }
}

export async function punchIn(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { locationStatus = "office" } = req.body;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const timeStr = formatTime(now);

    const geoProfile = GEO_PROFILES[locationStatus] || GEO_PROFILES.office;
    const locationRemarks = geoProfile.remarks;

    // Fetch user details for the record
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // 1. Update or create ActiveSession
    const session = await prisma.activeSession.upsert({
      where: { userId: req.user.id },
      update: {
        isActive: true,
        startTime: String(Date.now()),
        elapsedSeconds: 0,
        isOnBreak: false,
        breakStartTime: null,
        totalBreakSeconds: 0,
        locationStatus,
        geoDistanceKm: geoProfile.distanceKm,
      },
      create: {
        userId: req.user.id,
        isActive: true,
        startTime: String(Date.now()),
        elapsedSeconds: 0,
        isOnBreak: false,
        breakStartTime: null,
        totalBreakSeconds: 0,
        locationStatus,
        geoDistanceKm: geoProfile.distanceKm,
      },
    });

    // 2. Check if attendance record exists for today
    let attendanceRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: req.user.id,
        date: todayStr,
      },
    });

    if (attendanceRecord) {
      attendanceRecord = await prisma.attendanceRecord.update({
        where: { id: attendanceRecord.id },
        data: {
          checkIn: timeStr,
          status: "PRESENT",
          remarks: locationRemarks,
          locationStatus,
          geoDistanceKm: geoProfile.distanceKm,
          geoLabel: geoProfile.label,
        },
      });
    } else {
      attendanceRecord = await prisma.attendanceRecord.create({
        data: {
          userId: req.user.id,
          employeeName: `${user.profile?.firstName} ${user.profile?.lastName}`,
          employeeId: user.employeeId,
          department: user.profile?.department || "Engineering",
          date: todayStr,
          checkIn: timeStr,
          checkOut: null,
          totalHours: 0.1, // Seeded with initial time
          status: "PRESENT",
          remarks: locationRemarks,
          locationStatus,
          geoDistanceKm: geoProfile.distanceKm,
          geoLabel: geoProfile.label,
        },
      });
    }

    const formattedSession = {
      isActive: session.isActive,
      startTime: session.startTime ? Number(session.startTime) : null,
      elapsedSeconds: session.elapsedSeconds,
      isOnBreak: session.isOnBreak,
      breakStartTime: session.breakStartTime ? Number(session.breakStartTime) : null,
      totalBreakSeconds: session.totalBreakSeconds,
      locationStatus: session.locationStatus,
      geoDistanceKm: session.geoDistanceKm,
    };

    res.json({
      success: true,
      session: formattedSession,
      record: attendanceRecord,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Punch in failed" });
  }
}

export async function punchOut(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    let session = await prisma.activeSession.findUnique({
      where: { userId: req.user.id },
    });

    if (!session) {
      session = await prisma.activeSession.create({
        data: {
          userId: req.user.id,
          isActive: true,
          startTime: String(Date.now() - 4 * 3600 * 1000),
          elapsedSeconds: 14400,
          isOnBreak: false,
          totalBreakSeconds: 0,
        },
      });
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const timeStr = formatTime(now);

    // Calculate final hours (elapsedSeconds / 3600)
    let totalHours = Number(((session.elapsedSeconds || 14400) / 3600).toFixed(2));
    if (totalHours <= 0) totalHours = 8.0; // fallback

    // 1. Reset ActiveSession to inactive
    const updatedSession = await prisma.activeSession.update({
      where: { userId: req.user.id },
      data: {
        isActive: false,
        startTime: null,
        elapsedSeconds: 0,
        isOnBreak: false,
        breakStartTime: null,
        totalBreakSeconds: 0,
      },
    });

    // 2. Update today's attendance record
    const status = totalHours < 4.0 ? "HALF_DAY" : "PRESENT";

    // Find today's record
    let record = await prisma.attendanceRecord.findFirst({
      where: {
        userId: req.user.id,
        date: todayStr,
      },
    });

    if (record) {
      record = await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
          checkOut: timeStr,
          totalHours,
          status,
        },
      });
    } else {
      // Fallback: Create one if it somehow doesn't exist
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true },
      });
      record = await prisma.attendanceRecord.create({
        data: {
          userId: req.user.id,
          employeeName: `${user?.profile?.firstName} ${user?.profile?.lastName}`,
          employeeId: user?.employeeId || "",
          department: user?.profile?.department || "Engineering",
          date: todayStr,
          checkIn: timeStr,
          checkOut: timeStr,
          totalHours,
          status,
        },
      });
    }

    const formattedSession = {
      isActive: updatedSession.isActive,
      startTime: null,
      elapsedSeconds: 0,
      isOnBreak: false,
      breakStartTime: null,
      totalBreakSeconds: 0,
      locationStatus: updatedSession.locationStatus,
      geoDistanceKm: updatedSession.geoDistanceKm,
    };

    res.json({
      success: true,
      session: formattedSession,
      record,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Punch out failed" });
  }
}

export async function toggleBreak(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    let session = await prisma.activeSession.findUnique({
      where: { userId: req.user.id },
    });

    if (!session) {
      session = await prisma.activeSession.create({
        data: {
          userId: req.user.id,
          isActive: true,
          startTime: String(Date.now() - 4 * 3600 * 1000),
          elapsedSeconds: 14400,
          isOnBreak: false,
          totalBreakSeconds: 0,
        },
      });
    }

    let updatedSession;

    if (session.isOnBreak) {
      // End break: calculate break seconds and reset break fields
      const breakDuration = Math.floor((Date.now() - Number(session.breakStartTime)) / 1000);
      updatedSession = await prisma.activeSession.update({
        where: { userId: req.user.id },
        data: {
          isOnBreak: false,
          breakStartTime: null,
          totalBreakSeconds: session.totalBreakSeconds + (breakDuration > 0 ? breakDuration : 0),
        },
      });
    } else {
      // Start break
      updatedSession = await prisma.activeSession.update({
        where: { userId: req.user.id },
        data: {
          isOnBreak: true,
          breakStartTime: String(Date.now()),
        },
      });
    }

    const formattedSession = {
      isActive: updatedSession.isActive,
      startTime: updatedSession.startTime ? Number(updatedSession.startTime) : null,
      elapsedSeconds: updatedSession.elapsedSeconds,
      isOnBreak: updatedSession.isOnBreak,
      breakStartTime: updatedSession.breakStartTime ? Number(updatedSession.breakStartTime) : null,
      totalBreakSeconds: updatedSession.totalBreakSeconds,
      locationStatus: updatedSession.locationStatus,
      geoDistanceKm: updatedSession.geoDistanceKm,
    };

    res.json({ success: true, session: formattedSession });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Toggle break failed" });
  }
}

export async function syncSessionTimer(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { elapsedSeconds } = req.body;
    if (elapsedSeconds === undefined) {
      res.status(400).json({ success: false, message: "elapsedSeconds is required" });
      return;
    }

    const session = await prisma.activeSession.findUnique({
      where: { userId: req.user.id },
    });

    if (!session || !session.isActive) {
      res.status(400).json({ success: false, message: "Cannot sync timer: no active session" });
      return;
    }

    const updated = await prisma.activeSession.update({
      where: { userId: req.user.id },
      data: { elapsedSeconds },
    });

    const formattedSession = {
      isActive: updated.isActive,
      startTime: updated.startTime ? Number(updated.startTime) : null,
      elapsedSeconds: updated.elapsedSeconds,
      isOnBreak: updated.isOnBreak,
      breakStartTime: updated.breakStartTime ? Number(updated.breakStartTime) : null,
      totalBreakSeconds: updated.totalBreakSeconds,
      locationStatus: updated.locationStatus,
      geoDistanceKm: updated.geoDistanceKm,
    };

    res.json({ success: true, session: formattedSession });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to sync timer" });
  }
}

export async function overrideAttendance(req: AuthRequest, res: Response) {
  try {
    const requester = req.user;
    if (!requester || (requester.role !== "ADMIN" && requester.role !== "HR_OFFICER")) {
      res.status(403).json({ success: false, message: "Forbidden: Only Admin or HR can override records" });
      return;
    }

    const { id } = req.params as { id: string };
    const { checkIn, checkOut, totalHours, status, remarks } = req.body;

    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      res.status(404).json({ success: false, message: "Attendance record not found" });
      return;
    }

    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        checkIn: checkIn !== undefined ? checkIn : existingRecord.checkIn,
        checkOut: checkOut !== undefined ? checkOut : existingRecord.checkOut,
        totalHours: totalHours !== undefined ? totalHours : existingRecord.totalHours,
        status: status !== undefined ? status : existingRecord.status,
        remarks: remarks !== undefined ? remarks : existingRecord.remarks,
      },
    });

    res.json({ success: true, record: updatedRecord });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to override attendance" });
  }
}
