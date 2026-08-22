import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth";

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { userId: null }, // global notifications
        ],
      },
      orderBy: { id: "desc" }, // or by another sorting field
    });

    res.json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve notifications" });
  }
}

export async function markRead(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params as { id: string };

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    // Security check: Only the recipient can mark it read (unless it's global)
    if (notification.userId && notification.userId !== req.user.id) {
      res.status(403).json({ success: false, message: "Forbidden: Cannot edit another user's notifications" });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true, notification: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to mark notification as read" });
  }
}

export async function markAllRead(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: req.user.id },
          { userId: null }, // mark global notifications read if admin, or just user-specific
        ],
        read: false,
      },
      data: { read: true },
    });

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to clear notifications" });
  }
}
