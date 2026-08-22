import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth";

export async function getLeaves(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { role, id } = req.user;
    let leaves;

    if (role === "ADMIN" || role === "HR_OFFICER") {
      leaves = await prisma.leaveRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      leaves = await prisma.leaveRequest.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
      });
    }

    res.json({ success: true, leaves });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve leave requests" });
  }
}

export async function applyLeave(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { leaveType, startDate, endDate, totalDays, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !totalDays || !reason) {
      res.status(400).json({ success: false, message: "Missing required leave fields" });
      return;
    }

    // Retrieve full employee details
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        userId: req.user.id,
        employeeName: `${user.profile?.firstName} ${user.profile?.lastName}`,
        employeeId: user.employeeId,
        department: user.profile?.department || "Engineering",
        avatarUrl: user.profile?.avatarUrl || "",
        leaveType,
        startDate,
        endDate,
        totalDays: Number(totalDays),
        reason,
        status: "PENDING",
        createdAt: new Date().toISOString().split("T")[0],
      },
    });

    // Create a notification for Admins/HR Officers
    await prisma.notification.create({
      data: {
        title: "New Leave Application",
        message: `${user.profile?.firstName} applied for ${totalDays} day(s) of ${leaveType} leave.`,
        type: "leave",
        timestamp: "Just now",
        read: false,
      },
    });

    res.status(201).json({ success: true, leave: newLeave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to submit leave request" });
  }
}

export async function reviewLeave(req: AuthRequest, res: Response) {
  try {
    const reviewer = req.user;
    if (!reviewer || (reviewer.role !== "ADMIN" && reviewer.role !== "HR_OFFICER")) {
      res.status(403).json({ success: false, message: "Forbidden: Only Admin or HR can review leave requests" });
      return;
    }

    const { id } = req.params as { id: string };
    const { status, adminRemarks } = req.body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status selection" });
      return;
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      res.status(404).json({ success: false, message: "Leave request not found" });
      return;
    }

    const reviewerUser = await prisma.user.findUnique({
      where: { id: reviewer.id },
      include: { profile: true },
    });

    const reviewedByLabel = `${reviewerUser?.profile?.firstName} (${reviewer.role})`;

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        adminRemarks: adminRemarks || (status === "APPROVED" ? "Approved by HR" : "Declined by HR"),
        reviewedBy: reviewedByLabel,
      },
    });

    // Notify the applicant
    await prisma.notification.create({
      data: {
        userId: leave.userId,
        title: status === "APPROVED" ? "Leave Approved" : "Leave Declined",
        message: `Your leave request for ${leave.startDate} to ${leave.endDate} was ${status.toLowerCase()} by ${reviewerUser?.profile?.firstName}.`,
        type: "leave",
        timestamp: "Just now",
        read: false,
      },
    });

    res.json({ success: true, leave: updatedLeave });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to review leave request" });
  }
}
