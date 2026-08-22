-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "dateOfJoining" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "skills" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "uploadDate" TEXT NOT NULL,
    "url" TEXT,
    CONSTRAINT "Document_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "basicSalary" REAL NOT NULL,
    "hra" REAL NOT NULL,
    "allowances" REAL NOT NULL,
    "deductions" REAL NOT NULL,
    "netSalary" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "effectiveFrom" TEXT NOT NULL,
    "bankAccount" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "ifscCode" TEXT,
    "panOrTaxId" TEXT NOT NULL,
    "uanNumber" TEXT,
    CONSTRAINT "SalaryStructure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "checkIn" TEXT,
    "checkOut" TEXT,
    "totalHours" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "locationStatus" TEXT,
    "geoDistanceKm" REAL,
    "geoLabel" TEXT,
    "deviceFingerprint" TEXT,
    "ipAddress" TEXT,
    CONSTRAINT "AttendanceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "adminRemarks" TEXT,
    "reviewedBy" TEXT,
    "createdAt" TEXT NOT NULL,
    CONSTRAINT "LeaveRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ActiveSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "isOnBreak" BOOLEAN NOT NULL DEFAULT false,
    "breakStartTime" TEXT,
    "totalBreakSeconds" INTEGER NOT NULL DEFAULT 0,
    "locationStatus" TEXT,
    "geoDistanceKm" REAL,
    CONSTRAINT "ActiveSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructure_userId_key" ON "SalaryStructure"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveSession_userId_key" ON "ActiveSession"("userId");
