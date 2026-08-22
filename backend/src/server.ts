import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { register, login, switchUser, getMe, resetDatabase } from "./controllers/authController";
import { getAllUsers, getUserById, updateProfile, updateSalary } from "./controllers/userController";
import {
  getAttendance,
  getActiveSession,
  punchIn,
  punchOut,
  toggleBreak,
  syncSessionTimer,
  overrideAttendance,
} from "./controllers/attendanceController";
import { getLeaves, applyLeave, reviewLeave } from "./controllers/leaveController";
import { getNotifications, markRead, markAllRead } from "./controllers/notificationController";
import { authenticateToken } from "./middleware/auth";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "DayFlow backend is running",
  });
});

// Authentication Routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/switch", switchUser);
app.get("/api/auth/me", authenticateToken as any, getMe as any);
app.post("/api/reset", resetDatabase);

// User & Directory Routes
app.get("/api/users", authenticateToken as any, getAllUsers as any);
app.get("/api/users/:id", authenticateToken as any, getUserById as any);
app.put("/api/users/:id/profile", authenticateToken as any, updateProfile as any);
app.put("/api/users/:id/salary", authenticateToken as any, updateSalary as any);

// Attendance Routes
app.get("/api/attendance", authenticateToken as any, getAttendance as any);
app.get("/api/attendance/session", authenticateToken as any, getActiveSession as any);
app.post("/api/attendance/punch-in", authenticateToken as any, punchIn as any);
app.post("/api/attendance/punch-out", authenticateToken as any, punchOut as any);
app.post("/api/attendance/toggle-break", authenticateToken as any, toggleBreak as any);
app.post("/api/attendance/sync-timer", authenticateToken as any, syncSessionTimer as any);
app.put("/api/attendance/:id/override", authenticateToken as any, overrideAttendance as any);

// Leave Routes
app.get("/api/leaves", authenticateToken as any, getLeaves as any);
app.post("/api/leaves/apply", authenticateToken as any, applyLeave as any);
app.post("/api/leaves/:id/review", authenticateToken as any, reviewLeave as any);

// Notification Routes
app.get("/api/notifications", authenticateToken as any, getNotifications as any);
app.put("/api/notifications/:id/read", authenticateToken as any, markRead as any);
app.put("/api/notifications/read-all", authenticateToken as any, markAllRead as any);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DayFlow backend running on http://localhost:${PORT}`);
});