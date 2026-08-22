import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // Clean existing data
  await prisma.notification.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.activeSession.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.salaryStructure.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = "password123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Seed Users, Profiles, Salary, ActiveSession
  const usersData = [
    {
      id: "user-1",
      employeeId: "EMP-001",
      email: "aarav.mehta@dayflow.in",
      role: "ADMIN",
      isVerified: true,
      profile: {
        firstName: "Aarav",
        lastName: "Mehta",
        phone: "+91 98201 45678",
        address: "Flat 402, Prestige Palms, Indiranagar 100ft Road, Bengaluru, Karnataka 560038",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
        department: "Executive HR",
        designation: "VP of People & Culture / Admin",
        dateOfJoining: "2022-01-15",
        emergencyContact: "+91 98209 87654 (Spouse)",
        skills: "Strategic HR,Workplace Policy,Talent Acquisition,Statutory Payroll Audit,POSH Compliance",
        documents: [
          { name: "Executive_Appointment_Letter.pdf", type: "PDF", size: "1.8 MB", uploadDate: "2022-01-15" },
          { name: "NDA_Confidentiality_Signed.pdf", type: "PDF", size: "850 KB", uploadDate: "2022-01-15" },
          { name: "Aadhaar_PAN_Verified.pdf", type: "PDF", size: "2.4 MB", uploadDate: "2022-01-16" }
        ]
      },
      salary: {
        basicSalary: 95000,
        hra: 45000,
        allowances: 35000,
        deductions: 25000,
        netSalary: 150000,
        effectiveFrom: "2024-04-01",
        bankAccount: "•••• •••• 8842",
        bankName: "HDFC Bank (Indiranagar Branch)",
        ifscCode: "HDFC0000128",
        panOrTaxId: "AAAPM1234F",
        uanNumber: "100982341029"
      }
    },
    {
      id: "user-2",
      employeeId: "EMP-002",
      email: "pooja.iyer@dayflow.in",
      role: "HR_OFFICER",
      isVerified: true,
      profile: {
        firstName: "Pooja",
        lastName: "Iyer",
        phone: "+91 98450 67890",
        address: "Tower B-804, Sobha Quartz, Bellandur Outer Ring Road, Bengaluru, Karnataka 560103",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja",
        department: "Human Resources",
        designation: "Lead People Operations Specialist",
        dateOfJoining: "2022-06-01",
        emergencyContact: "+91 98455 12345 (Father)",
        skills: "Employee Relations,HR Compliance,Benefits Admin,Campus Recruitment,Labor Law",
        documents: [
          { name: "Employment_Contract_Pooja.pdf", type: "PDF", size: "1.4 MB", uploadDate: "2022-06-01" },
          { name: "SHRM_HR_Certification.pdf", type: "PDF", size: "3.1 MB", uploadDate: "2022-06-05" }
        ]
      },
      salary: {
        basicSalary: 55000,
        hra: 25000,
        allowances: 18000,
        deductions: 13000,
        netSalary: 85000,
        effectiveFrom: "2024-04-01",
        bankAccount: "•••• •••• 3190",
        bankName: "ICICI Bank (Koramangala Branch)",
        ifscCode: "ICIC0000047",
        panOrTaxId: "BCKPI5678K",
        uanNumber: "100874561928"
      }
    },
    {
      id: "user-3",
      employeeId: "EMP-003",
      email: "rohan.verma@dayflow.in",
      role: "EMPLOYEE",
      isVerified: true,
      profile: {
        firstName: "Rohan",
        lastName: "Verma",
        phone: "+91 99100 23456",
        address: "Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
        department: "Engineering",
        designation: "Senior Staff Frontend Architect",
        dateOfJoining: "2023-02-10",
        emergencyContact: "+91 99109 87654 (Spouse)",
        skills: "React 19,Next.js 15,TypeScript,TailwindCSS,System Architecture,Web Performance",
        documents: [
          { name: "Rohan_Verma_Appointment_Letter.pdf", type: "PDF", size: "1.2 MB", uploadDate: "2023-02-10" },
          { name: "Tax_Declaration_Form12BB.pdf", type: "PDF", size: "620 KB", uploadDate: "2023-02-12" },
          { name: "Form16_Previous_Employer.pdf", type: "PDF", size: "480 KB", uploadDate: "2023-02-12" }
        ]
      },
      salary: {
        basicSalary: 70000,
        hra: 35000,
        allowances: 25000,
        deductions: 18000,
        netSalary: 112000,
        effectiveFrom: "2024-04-01",
        bankAccount: "•••• •••• 5521",
        bankName: "State Bank of India (Whitefield)",
        ifscCode: "SBIN0004118",
        panOrTaxId: "AAAPV8829J",
        uanNumber: "100452391048"
      }
    },
    {
      id: "user-4",
      employeeId: "EMP-004",
      email: "ananya.deshmukh@dayflow.in",
      role: "EMPLOYEE",
      isVerified: true,
      profile: {
        firstName: "Ananya",
        lastName: "Deshmukh",
        phone: "+91 97654 32109",
        address: "Skyline Penthouse 12A, Powai Hiranandani, Mumbai, Maharashtra 400076",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
        department: "Product Design",
        designation: "Lead Product & UX Designer",
        dateOfJoining: "2023-04-18",
        emergencyContact: "+91 97650 98765 (Mother)",
        skills: "Design Systems,Figma,User Research,Prototyping,Accessibility",
        documents: [
          { name: "Ananya_Offer_Letter.pdf", type: "PDF", size: "1.1 MB", uploadDate: "2023-04-18" },
          { name: "IP_Assignment_Agreement.pdf", type: "PDF", size: "920 KB", uploadDate: "2023-04-19" }
        ]
      },
      salary: {
        basicSalary: 62000,
        hra: 30000,
        allowances: 20000,
        deductions: 14000,
        netSalary: 98000,
        effectiveFrom: "2024-04-01",
        bankAccount: "•••• •••• 7712",
        bankName: "Kotak Mahindra Bank (Powai)",
        ifscCode: "KKBK0000654",
        panOrTaxId: "DEEPD3329M",
        uanNumber: "100881902314"
      }
    },
    {
      id: "user-5",
      employeeId: "EMP-005",
      email: "vikram.malhotra@dayflow.in",
      role: "EMPLOYEE",
      isVerified: true,
      profile: {
        firstName: "Vikram",
        lastName: "Malhotra",
        phone: "+91 98112 34567",
        address: "Tower 4, DLF Cyber City Phase 2, Gurugram, Haryana 122002",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        department: "Engineering",
        designation: "Full Stack Backend Developer",
        dateOfJoining: "2023-08-01",
        emergencyContact: "+91 98110 54321 (Brother)",
        skills: "Node.js,PostgreSQL,Prisma,Redis,Docker,REST APIs,FastAPI",
        documents: [
          { name: "Vikram_Joining_Kit.pdf", type: "PDF", size: "1.3 MB", uploadDate: "2023-08-01" }
        ]
      },
      salary: {
        basicSalary: 52000,
        hra: 24000,
        allowances: 16000,
        deductions: 12000,
        netSalary: 80000,
        effectiveFrom: "2024-04-01",
        bankAccount: "•••• •••• 9014",
        bankName: "Axis Bank (Cyber City)",
        ifscCode: "UTIB0000123",
        panOrTaxId: "FFKPM6610N",
        uanNumber: "100771829034"
      }
    },
    {
      id: "user-6",
      employeeId: "EMP-006",
      email: "sneha.reddy@dayflow.in",
      role: "EMPLOYEE",
      isVerified: true,
      profile: {
        firstName: "Sneha",
        lastName: "Reddy",
        phone: "+91 99490 12345",
        address: "Flat 501, Aparna CyberLife, HITEC City, Hyderabad, Telangana 500081",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        department: "Infrastructure",
        designation: "DevOps & Site Reliability Engineer",
        dateOfJoining: "2023-10-15",
        emergencyContact: "+91 99499 87654 (Mother)",
        skills: "Kubernetes,AWS,Terraform,CI/CD,Docker,Linux Admin",
        documents: [
          { name: "Sneha_Contract_Signed.pdf", type: "PDF", size: "1.5 MB", uploadDate: "2023-10-15" }
        ]
      },
      salary: {
        basicSalary: 58000,
        hra: 28000,
        allowances: 18000,
        deductions: 14000,
        netSalary: 90000,
        effectiveFrom: "2024-04-01",
        bankAccount: "•••• •••• 4429",
        bankName: "HDFC Bank (HITEC City)",
        ifscCode: "HDFC0000543",
        panOrTaxId: "GGSPR7718P",
        uanNumber: "100661928374"
      }
    }
  ];

  for (const u of usersData) {
    const { profile, salary, ...userData } = u;
    const { documents, ...profileData } = profile;

    await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        profile: {
          create: {
            ...profileData,
            documents: {
              create: documents
            }
          }
        },
        salary: {
          create: salary
        },
        activeSession: {
          create: {
            isActive: true,
            startTime: String(Date.now() - 4 * 3600 * 1000), // 4 hours ago for demo
            elapsedSeconds: 14400,
            isOnBreak: false,
            breakStartTime: null,
            totalBreakSeconds: 0,
            locationStatus: "office",
            geoDistanceKm: 0.03
          }
        }
      }
    });
  }
  console.log("Seeded default users, profiles, salaries, activeSessions.");

  // 2. Seed Leaves
  const leavesData = [
    {
      id: "leave-1",
      userId: "user-3",
      employeeName: "Rohan Verma",
      employeeId: "EMP-003",
      department: "Engineering",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
      leaveType: "PAID",
      startDate: "2026-08-28",
      endDate: "2026-08-30",
      totalDays: 3,
      reason: "Family visit to ancestral home in Jaipur for Ganesh Chaturthi celebrations.",
      status: "PENDING",
      createdAt: "2026-08-21"
    },
    {
      id: "leave-2",
      userId: "user-4",
      employeeName: "Ananya Deshmukh",
      employeeId: "EMP-004",
      department: "Product Design",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      leaveType: "SICK",
      startDate: "2026-08-24",
      endDate: "2026-08-24",
      totalDays: 1,
      reason: "Medical appointment for routine dental checkup and rest.",
      status: "PENDING",
      createdAt: "2026-08-22"
    },
    {
      id: "leave-3",
      userId: "user-5",
      employeeName: "Vikram Malhotra",
      employeeId: "EMP-005",
      department: "Engineering",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      leaveType: "PAID",
      startDate: "2026-08-10",
      endDate: "2026-08-14",
      totalDays: 5,
      reason: "Independence Day extended week vacation with family to Ladakh.",
      status: "APPROVED",
      adminRemarks: "Approved by HR. Have a wonderful trip Vikram!",
      reviewedBy: "Pooja Iyer (HR)",
      createdAt: "2026-08-01"
    },
    {
      id: "leave-4",
      userId: "user-6",
      employeeName: "Sneha Reddy",
      employeeId: "EMP-006",
      department: "Infrastructure",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
      leaveType: "UNPAID",
      startDate: "2026-07-20",
      endDate: "2026-07-21",
      totalDays: 2,
      reason: "Relocating to new apartment in Hyderabad.",
      status: "APPROVED",
      adminRemarks: "Approved by Admin.",
      reviewedBy: "Aarav Mehta (Admin)",
      createdAt: "2026-07-15"
    }
  ];

  for (const l of leavesData) {
    await prisma.leaveRequest.create({
      data: l
    });
  }
  console.log("Seeded leave requests.");

  // 3. Seed Attendance Records
  const attendanceData = [
    {
      id: "att-today-1",
      userId: "user-1",
      employeeName: "Aarav Mehta",
      employeeId: "EMP-001",
      department: "Executive HR",
      date: "2026-08-22",
      checkIn: "08:45 AM",
      checkOut: null,
      totalHours: 4.5,
      status: "PRESENT",
      remarks: "Morning executive review meeting",
      locationStatus: "office",
      ipAddress: "10.14.20.101",
      deviceFingerprint: "DAYFLOW-BLR-01"
    },
    {
      id: "att-today-2",
      userId: "user-2",
      employeeName: "Pooja Iyer",
      employeeId: "EMP-002",
      department: "Human Resources",
      date: "2026-08-22",
      checkIn: "09:02 AM",
      checkOut: null,
      totalHours: 4.2,
      status: "PRESENT",
      remarks: "New cohort induction session",
      locationStatus: "office",
      ipAddress: "10.14.20.102",
      deviceFingerprint: "DAYFLOW-BLR-02"
    },
    {
      id: "att-today-3",
      userId: "user-3",
      employeeName: "Rohan Verma",
      employeeId: "EMP-003",
      department: "Engineering",
      date: "2026-08-22",
      checkIn: "09:15 AM",
      checkOut: null,
      totalHours: 4.0,
      status: "PRESENT",
      remarks: "Frontend release candidate & architecture",
      locationStatus: "office",
      ipAddress: "10.14.20.103",
      deviceFingerprint: "DAYFLOW-BLR-03"
    },
    {
      id: "att-today-4",
      userId: "user-4",
      employeeName: "Ananya Deshmukh",
      employeeId: "EMP-004",
      department: "Product Design",
      date: "2026-08-22",
      checkIn: "09:30 AM",
      checkOut: null,
      totalHours: 3.8,
      status: "PRESENT",
      remarks: "Design system tokens review",
      locationStatus: "office",
      ipAddress: "10.14.20.104",
      deviceFingerprint: "DAYFLOW-BLR-04"
    },
    {
      id: "att-today-5",
      userId: "user-5",
      employeeName: "Vikram Malhotra",
      employeeId: "EMP-005",
      department: "Engineering",
      date: "2026-08-22",
      checkIn: null,
      checkOut: null,
      totalHours: 0,
      status: "ABSENT",
      remarks: "Unscheduled absent / Standby",
      locationStatus: "blocked",
      ipAddress: "192.168.1.99",
      deviceFingerprint: "UNKNOWN-DEVICE"
    },
    {
      id: "att-today-6",
      userId: "user-6",
      employeeName: "Sneha Reddy",
      employeeId: "EMP-006",
      department: "Infrastructure",
      date: "2026-08-22",
      checkIn: "09:00 AM",
      checkOut: "01:30 PM",
      totalHours: 4.5,
      status: "HALF_DAY",
      remarks: "Half-day for AWS Architect exam",
      locationStatus: "office",
      ipAddress: "10.14.20.106",
      deviceFingerprint: "DAYFLOW-HYD-01"
    },
    {
      id: "att-hist-1",
      userId: "user-3",
      employeeName: "Rohan Verma",
      employeeId: "EMP-003",
      department: "Engineering",
      date: "2026-08-21",
      checkIn: "09:05 AM",
      checkOut: "06:15 PM",
      totalHours: 8.75,
      status: "PRESENT",
      remarks: "Sprint release build",
      locationStatus: "office"
    },
    {
      id: "att-hist-2",
      userId: "user-3",
      employeeName: "Rohan Verma",
      employeeId: "EMP-003",
      department: "Engineering",
      date: "2026-08-20",
      checkIn: "08:58 AM",
      checkOut: "06:00 PM",
      totalHours: 8.53,
      status: "PRESENT",
      locationStatus: "office"
    },
    {
      id: "att-hist-3",
      userId: "user-3",
      employeeName: "Rohan Verma",
      employeeId: "EMP-003",
      department: "Engineering",
      date: "2026-08-19",
      checkIn: "09:12 AM",
      checkOut: "06:30 PM",
      totalHours: 8.8,
      status: "PRESENT",
      locationStatus: "office"
    },
    {
      id: "att-hist-4",
      userId: "user-3",
      employeeName: "Rohan Verma",
      employeeId: "EMP-003",
      department: "Engineering",
      date: "2026-08-18",
      checkIn: "09:20 AM",
      checkOut: "01:30 PM",
      totalHours: 4.16,
      status: "HALF_DAY",
      remarks: "Medical checkup afternoon",
      locationStatus: "office"
    },
    {
      id: "att-hist-5",
      userId: "user-3",
      employeeName: "Rohan Verma",
      employeeId: "EMP-003",
      department: "Engineering",
      date: "2026-08-15",
      checkIn: "09:00 AM",
      checkOut: "05:45 PM",
      totalHours: 8.75,
      status: "PRESENT",
      remarks: "Independence Day special project setup",
      locationStatus: "office"
    }
  ];

  for (const a of attendanceData) {
    await prisma.attendanceRecord.create({
      data: a
    });
  }
  console.log("Seeded attendance records.");

  // 4. Seed Notifications
  const notificationsData = [
    {
      id: "notif-1",
      userId: "user-3", // Rohan
      title: "Salary Statement Credited (August 2026)",
      message: "Your official monthly compensation statement is generated and credited via NEFT/RTGS.",
      type: "payroll",
      timestamp: "2 hours ago",
      read: false
    },
    {
      id: "notif-2",
      userId: "user-1", // Aarav (Admin)
      title: "Leave Request Received",
      message: "Rohan Verma submitted a Paid Leave application for Aug 28-30.",
      type: "leave",
      timestamp: "Yesterday",
      read: false
    },
    {
      id: "notif-3",
      userId: "user-3", // Rohan
      title: "Tax Declaration Window Open",
      message: "Submit your Form 12BB investment proofs under the New Tax Regime by month end.",
      type: "system",
      timestamp: "3 days ago",
      read: true
    }
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: n
    });
  }
  console.log("Seeded notifications.");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
