import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow_super_secret_jwt_key_123";

const registerSchema = z.object({
  employeeId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "HR_OFFICER", "EMPLOYEE"]),
  department: z.string().min(1),
  designation: z.string().min(1),
});

const loginSchema = z.object({
  emailOrEmpId: z.string().min(1),
  password: z.string().min(1),
});

// Helper to generate JWT token
function generateToken(user: { id: string; employeeId: string; email: string; role: string }) {
  return jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function register(req: AuthRequest, res: Response) {
  try {
    const validated = registerSchema.parse(req.body);

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: validated.email }, { employeeId: validated.employeeId }],
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "User with this email or employee ID already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: validated.email,
        employeeId: validated.employeeId,
        passwordHash,
        role: validated.role,
        isVerified: true,
        profile: {
          create: {
            firstName: validated.firstName,
            lastName: validated.lastName,
            phone: "+91 98765 43210",
            address: "100ft Road, Indiranagar, Bengaluru, Karnataka 560038",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${validated.firstName}`,
            department: validated.department,
            designation: validated.designation,
            dateOfJoining: new Date().toISOString().split("T")[0],
          },
        },
        salary: {
          create: {
            basicSalary: 60000,
            hra: 28000,
            allowances: 18000,
            deductions: 14000,
            netSalary: 92000,
            effectiveFrom: new Date().toISOString().split("T")[0],
            bankAccount: "•••• •••• 1234",
            bankName: "HDFC Bank (Bengaluru)",
            ifscCode: "HDFC0000128",
            panOrTaxId: `AAAPM${Math.floor(1000 + Math.random() * 9000)}F`,
            uanNumber: `100${Math.floor(100000000 + Math.random() * 900000000)}`,
          },
        },
        activeSession: {
          create: {
            isActive: false,
            startTime: null,
            elapsedSeconds: 0,
            isOnBreak: false,
            breakStartTime: null,
            totalBreakSeconds: 0,
            locationStatus: "office",
            geoDistanceKm: 0.03,
          },
        },
      },
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
        salary: true,
      },
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        profile: newUser.profile,
        salary: newUser.salary,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Registration failed" });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { emailOrEmpId, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrEmpId }, { employeeId: emailOrEmpId }],
      },
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
        salary: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email/employee ID or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, message: "Invalid email/employee ID or password" });
      return;
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        salary: user.salary,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Login failed" });
  }
}

export async function switchUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
        salary: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        salary: user.salary,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Switch user failed" });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
        salary: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        salary: user.salary,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve user details" });
  }
}

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function resetDatabase(req: AuthRequest, res: Response) {
  try {
    // Run the prisma db seed command
    await execAsync("npx prisma db seed");
    res.json({ success: true, message: "Demo database reset successful" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Database reset failed" });
  }
}

