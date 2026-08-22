import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth";

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          include: {
            documents: true,
          },
        },
        salary: true,
      },
    });

    // Formats users response data
    const formatted = users.map((u: any) => ({
      id: u.id,
      employeeId: u.employeeId,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      profile: u.profile,
      salary: u.salary,
    }));

    res.json({ success: true, users: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve directory" });
  }
}

export async function getUserById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
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
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve user" });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const requester = req.user;

    if (!requester) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Role gate: Employees can only edit their own profile, and only specific fields.
    const isAdminOrHR = requester.role === "ADMIN" || requester.role === "HR_OFFICER";
    if (!isAdminOrHR && requester.id !== id) {
      res.status(403).json({ success: false, message: "Forbidden: Cannot edit another user's profile" });
      return;
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      avatarUrl,
      department,
      designation,
      dateOfJoining,
      emergencyContact,
      skills,
    } = req.body;

    // Build update object based on privileges
    let profileUpdate: any = {};

    if (isAdminOrHR) {
      if (firstName !== undefined) profileUpdate.firstName = firstName;
      if (lastName !== undefined) profileUpdate.lastName = lastName;
      if (department !== undefined) profileUpdate.department = department;
      if (designation !== undefined) profileUpdate.designation = designation;
      if (dateOfJoining !== undefined) profileUpdate.dateOfJoining = dateOfJoining;
    }

    // Common fields both Employee (own profile) and Admin/HR can edit
    if (phone !== undefined) profileUpdate.phone = phone;
    if (address !== undefined) profileUpdate.address = address;
    if (avatarUrl !== undefined) profileUpdate.avatarUrl = avatarUrl;
    if (emergencyContact !== undefined) profileUpdate.emergencyContact = emergencyContact;
    if (skills !== undefined) {
      // In seed, we use a string. If we get array, convert to string
      profileUpdate.skills = Array.isArray(skills) ? skills.join(",") : skills;
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: id },
      data: profileUpdate,
      include: {
        documents: true,
      },
    });

    res.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update profile" });
  }
}

export async function updateSalary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const requester = req.user;

    if (!requester || (requester.role !== "ADMIN" && requester.role !== "HR_OFFICER")) {
      res.status(403).json({ success: false, message: "Forbidden: Only Admin or HR can adjust compensation" });
      return;
    }

    const currentSalary = await prisma.salaryStructure.findUnique({
      where: { userId: id },
    });

    if (!currentSalary) {
      res.status(404).json({ success: false, message: "Salary structure not found" });
      return;
    }

    const {
      basicSalary,
      hra,
      allowances,
      deductions,
      effectiveFrom,
      bankAccount,
      bankName,
      ifscCode,
      panOrTaxId,
      uanNumber,
    } = req.body;

    const basic = basicSalary !== undefined ? basicSalary : currentSalary.basicSalary;
    const hrVal = hra !== undefined ? hra : currentSalary.hra;
    const allow = allowances !== undefined ? allowances : currentSalary.allowances;
    const deduct = deductions !== undefined ? deductions : currentSalary.deductions;
    const netSalary = basic + hrVal + allow - deduct;

    const updatedSalary = await prisma.salaryStructure.update({
      where: { userId: id },
      data: {
        basicSalary: basic,
        hra: hrVal,
        allowances: allow,
        deductions: deduct,
        netSalary,
        effectiveFrom: effectiveFrom !== undefined ? effectiveFrom : currentSalary.effectiveFrom,
        bankAccount: bankAccount !== undefined ? bankAccount : currentSalary.bankAccount,
        bankName: bankName !== undefined ? bankName : currentSalary.bankName,
        ifscCode: ifscCode !== undefined ? ifscCode : currentSalary.ifscCode,
        panOrTaxId: panOrTaxId !== undefined ? panOrTaxId : currentSalary.panOrTaxId,
        uanNumber: uanNumber !== undefined ? uanNumber : currentSalary.uanNumber,
      },
    });

    res.json({ success: true, salary: updatedSalary });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update salary" });
  }
}
