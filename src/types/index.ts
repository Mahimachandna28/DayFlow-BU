export type Role = 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export type LeaveType = 'PAID' | 'SICK' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type MockLocationStatus = 'office' | 'remote' | 'blocked';

export type SecurityAlertSeverity = 'Info' | 'Warning' | 'Critical';

export interface SecurityAlert {
  id: string;
  recordId: string;
  employeeName: string;
  employeeId: string;
  date: string;
  title: string;
  detail: string;
  severity: SecurityAlertSeverity;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url?: string;
}

export interface SalaryStructure {
  basicSalary: number;
  hra: number; // House Rent Allowance
  allowances: number; // Special/Dearness/Transport Allowance
  deductions: number; // EPF + Professional Tax + TDS
  netSalary: number;
  currency: string; // 'INR'
  effectiveFrom: string;
  bankAccount: string;
  bankName: string;
  ifscCode?: string;
  panOrTaxId: string; // PAN Number e.g. ABCDE1234F
  uanNumber?: string; // EPF Universal Account Number
}

export interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  avatarUrl: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  employeeId: string;
  email: string;
  emergencyContact?: string;
  skills?: string[];
  documents: DocumentItem[];
}

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: Role;
  isVerified: boolean;
  profile: Profile;
  salary: SalaryStructure;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // e.g. "09:15 AM"
  checkOut: string | null; // e.g. "06:30 PM"
  totalHours: number;
  status: AttendanceStatus;
  remarks?: string;
  locationStatus?: MockLocationStatus;
  geoDistanceKm?: number | null;
  geoLabel?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  avatarUrl: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  adminRemarks?: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'leave' | 'attendance' | 'payroll' | 'system';
  timestamp: string;
  read: boolean;
}

export interface ActiveWorkSession {
  isActive: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  isOnBreak: boolean;
  breakStartTime: number | null;
  totalBreakSeconds: number;
  locationStatus?: MockLocationStatus;
  geoDistanceKm?: number | null;
}
