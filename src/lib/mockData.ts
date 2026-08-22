import { User, AttendanceRecord, LeaveRequest, NotificationItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    employeeId: 'EMP-001',
    email: 'aarav.mehta@dayflow.in',
    role: 'ADMIN',
    isVerified: true,
    profile: {
      firstName: 'Aarav',
      lastName: 'Mehta',
      phone: '+91 98201 45678',
      address: 'Flat 402, Prestige Palms, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'Executive HR',
      designation: 'VP of People & Culture / Admin',
      dateOfJoining: '2022-01-15',
      employeeId: 'EMP-001',
      email: 'aarav.mehta@dayflow.in',
      emergencyContact: '+91 98209 87654 (Spouse)',
      skills: ['Strategic HR', 'Workplace Policy', 'Talent Acquisition', 'Statutory Payroll Audit', 'POSH Compliance'],
      documents: [
        { id: 'doc-1', name: 'Executive_Appointment_Letter.pdf', type: 'PDF', size: '1.8 MB', uploadDate: '2022-01-15' },
        { id: 'doc-2', name: 'NDA_Confidentiality_Signed.pdf', type: 'PDF', size: '850 KB', uploadDate: '2022-01-15' },
        { id: 'doc-3', name: 'Aadhaar_PAN_Verified.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2022-01-16' },
      ],
    },
    salary: {
      basicSalary: 95000,
      hra: 45000,
      allowances: 35000,
      deductions: 25000,
      netSalary: 150000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 8842',
      bankName: 'HDFC Bank (Indiranagar Branch)',
      ifscCode: 'HDFC0000128',
      panOrTaxId: 'AAAPM1234F',
      uanNumber: '100982341029',
    },
  },
  {
    id: 'user-2',
    employeeId: 'EMP-002',
    email: 'pooja.iyer@dayflow.in',
    role: 'HR_OFFICER',
    isVerified: true,
    profile: {
      firstName: 'Pooja',
      lastName: 'Iyer',
      phone: '+91 98450 67890',
      address: 'Tower B-804, Sobha Quartz, Bellandur Outer Ring Road, Bengaluru, Karnataka 560103',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      department: 'Human Resources',
      designation: 'Lead People Operations Specialist',
      dateOfJoining: '2022-06-01',
      employeeId: 'EMP-002',
      email: 'pooja.iyer@dayflow.in',
      emergencyContact: '+91 98455 12345 (Father)',
      skills: ['Employee Relations', 'HR Compliance', 'Benefits Admin', 'Campus Recruitment', 'Labor Law'],
      documents: [
        { id: 'doc-4', name: 'Employment_Contract_Pooja.pdf', type: 'PDF', size: '1.4 MB', uploadDate: '2022-06-01' },
        { id: 'doc-5', name: 'SHRM_HR_Certification.pdf', type: 'PDF', size: '3.1 MB', uploadDate: '2022-06-05' },
      ],
    },
    salary: {
      basicSalary: 55000,
      hra: 25000,
      allowances: 18000,
      deductions: 13000,
      netSalary: 85000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 3190',
      bankName: 'ICICI Bank (Koramangala Branch)',
      ifscCode: 'ICIC0000047',
      panOrTaxId: 'BCKPI5678K',
      uanNumber: '100874561928',
    },
  },
  {
    id: 'user-3',
    employeeId: 'EMP-003',
    email: 'rohan.verma@dayflow.in',
    role: 'EMPLOYEE',
    isVerified: true,
    profile: {
      firstName: 'Rohan',
      lastName: 'Verma',
      phone: '+91 99100 23456',
      address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'Senior Staff Frontend Architect',
      dateOfJoining: '2023-02-10',
      employeeId: 'EMP-003',
      email: 'rohan.verma@dayflow.in',
      emergencyContact: '+91 99109 87654 (Spouse)',
      skills: ['React 19', 'Next.js 15', 'TypeScript', 'TailwindCSS', 'System Architecture', 'Web Performance'],
      documents: [
        { id: 'doc-6', name: 'Rohan_Verma_Appointment_Letter.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2023-02-10' },
        { id: 'doc-7', name: 'Tax_Declaration_Form12BB.pdf', type: 'PDF', size: '620 KB', uploadDate: '2023-02-12' },
        { id: 'doc-8', name: 'Form16_Previous_Employer.pdf', type: 'PDF', size: '480 KB', uploadDate: '2023-02-12' },
      ],
    },
    salary: {
      basicSalary: 70000,
      hra: 35000,
      allowances: 25000,
      deductions: 18000,
      netSalary: 112000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 5521',
      bankName: 'State Bank of India (Whitefield)',
      ifscCode: 'SBIN0004118',
      panOrTaxId: 'AAAPV8829J',
      uanNumber: '100452391048',
    },
  },
  {
    id: 'user-4',
    employeeId: 'EMP-004',
    email: 'ananya.deshmukh@dayflow.in',
    role: 'EMPLOYEE',
    isVerified: true,
    profile: {
      firstName: 'Ananya',
      lastName: 'Deshmukh',
      phone: '+91 97654 32109',
      address: 'Skyline Penthouse 12A, Powai Hiranandani, Mumbai, Maharashtra 400076',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      department: 'Product Design',
      designation: 'Lead Product & UX Designer',
      dateOfJoining: '2023-04-18',
      employeeId: 'EMP-004',
      email: 'ananya.deshmukh@dayflow.in',
      emergencyContact: '+91 97650 98765 (Mother)',
      skills: ['Design Systems', 'Figma', 'User Research', 'Prototyping', 'Accessibility'],
      documents: [
        { id: 'doc-9', name: 'Ananya_Offer_Letter.pdf', type: 'PDF', size: '1.1 MB', uploadDate: '2023-04-18' },
        { id: 'doc-10', name: 'IP_Assignment_Agreement.pdf', type: 'PDF', size: '920 KB', uploadDate: '2023-04-19' },
      ],
    },
    salary: {
      basicSalary: 62000,
      hra: 30000,
      allowances: 20000,
      deductions: 14000,
      netSalary: 98000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 7712',
      bankName: 'Kotak Mahindra Bank (Powai)',
      ifscCode: 'KKBK0000654',
      panOrTaxId: 'DEEPD3329M',
      uanNumber: '100881902314',
    },
  },
  {
    id: 'user-5',
    employeeId: 'EMP-005',
    email: 'vikram.malhotra@dayflow.in',
    role: 'EMPLOYEE',
    isVerified: true,
    profile: {
      firstName: 'Vikram',
      lastName: 'Malhotra',
      phone: '+91 98112 34567',
      address: 'Tower 4, DLF Cyber City Phase 2, Gurugram, Haryana 122002',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'Full Stack Backend Developer',
      dateOfJoining: '2023-08-01',
      employeeId: 'EMP-005',
      email: 'vikram.malhotra@dayflow.in',
      emergencyContact: '+91 98110 54321 (Brother)',
      skills: ['Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'Docker', 'REST APIs', 'FastAPI'],
      documents: [
        { id: 'doc-11', name: 'Vikram_Joining_Kit.pdf', type: 'PDF', size: '1.3 MB', uploadDate: '2023-08-01' },
      ],
    },
    salary: {
      basicSalary: 52000,
      hra: 24000,
      allowances: 16000,
      deductions: 12000,
      netSalary: 80000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 9014',
      bankName: 'Axis Bank (Cyber City)',
      ifscCode: 'UTIB0000123',
      panOrTaxId: 'FFKPM6610N',
      uanNumber: '100771829034',
    },
  },
  {
    id: 'user-6',
    employeeId: 'EMP-006',
    email: 'sneha.reddy@dayflow.in',
    role: 'EMPLOYEE',
    isVerified: true,
    profile: {
      firstName: 'Sneha',
      lastName: 'Reddy',
      phone: '+91 99490 12345',
      address: 'Flat 501, Aparna CyberLife, HITEC City, Hyderabad, Telangana 500081',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      department: 'Infrastructure',
      designation: 'DevOps & Site Reliability Engineer',
      dateOfJoining: '2023-10-15',
      employeeId: 'EMP-006',
      email: 'sneha.reddy@dayflow.in',
      emergencyContact: '+91 99499 87654 (Mother)',
      skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Docker', 'Linux Admin'],
      documents: [
        { id: 'doc-12', name: 'Sneha_Contract_Signed.pdf', type: 'PDF', size: '1.5 MB', uploadDate: '2023-10-15' },
      ],
    },
    salary: {
      basicSalary: 58000,
      hra: 28000,
      allowances: 18000,
      deductions: 14000,
      netSalary: 90000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 4429',
      bankName: 'HDFC Bank (HITEC City)',
      ifscCode: 'HDFC0000543',
      panOrTaxId: 'GGSPR7718P',
      uanNumber: '100661928374',
    },
  },
  {
    id: 'user-7',
    employeeId: 'EMP-007',
    email: 'arjun.nair@dayflow.in',
    role: 'EMPLOYEE',
    isVerified: true,
    profile: {
      firstName: 'Arjun',
      lastName: 'Nair',
      phone: '+91 98480 34567',
      address: 'Plot 88, Baner High Street, Pune, Maharashtra 411045',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      designation: 'Staff QA Automation Engineer',
      dateOfJoining: '2023-11-01',
      employeeId: 'EMP-007',
      email: 'arjun.nair@dayflow.in',
      emergencyContact: '+91 98489 87654 (Brother)',
      skills: ['Playwright', 'Cypress', 'Jest', 'Load Testing', 'CI Test Pipelines', 'Security Testing'],
      documents: [
        { id: 'doc-13', name: 'Arjun_Nair_Offer_Letter.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2023-11-01' },
      ],
    },
    salary: {
      basicSalary: 48000,
      hra: 22000,
      allowances: 15000,
      deductions: 10000,
      netSalary: 75000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 6619',
      bankName: 'Axis Bank (Baner Branch)',
      ifscCode: 'UTIB0000412',
      panOrTaxId: 'HHQAN4412Q',
      uanNumber: '100551928371',
    },
  },
  {
    id: 'user-8',
    employeeId: 'EMP-008',
    email: 'neha.patel@dayflow.in',
    role: 'EMPLOYEE',
    isVerified: true,
    profile: {
      firstName: 'Neha',
      lastName: 'Patel',
      phone: '+91 98250 89012',
      address: 'Tower C-1402, Sector 62, Noida, Uttar Pradesh 201309',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'Product Design',
      designation: 'Product Marketing & Growth Lead',
      dateOfJoining: '2024-01-08',
      employeeId: 'EMP-008',
      email: 'neha.patel@dayflow.in',
      emergencyContact: '+91 98259 87654 (Father)',
      skills: ['Product Analytics', 'UX Writing', 'Go-To-Market', 'Design Systems', 'Customer Empathy'],
      documents: [
        { id: 'doc-14', name: 'Neha_Patel_Joining_Dossier.pdf', type: 'PDF', size: '1.6 MB', uploadDate: '2024-01-08' },
      ],
    },
    salary: {
      basicSalary: 52000,
      hra: 24000,
      allowances: 16000,
      deductions: 12000,
      netSalary: 80000,
      currency: 'INR',
      effectiveFrom: '2024-04-01',
      bankAccount: '•••• •••• 9928',
      bankName: 'HDFC Bank (Noida Sector 62)',
      ifscCode: 'HDFC0000214',
      panOrTaxId: 'IIRNP9910R',
      uanNumber: '100441928399',
    },
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    userId: 'user-3',
    employeeName: 'Rohan Verma',
    employeeId: 'EMP-003',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    leaveType: 'PAID',
    startDate: '2026-08-28',
    endDate: '2026-08-30',
    totalDays: 3,
    reason: 'Family visit to ancestral home in Jaipur for Ganesh Chaturthi celebrations.',
    status: 'PENDING',
    createdAt: '2026-08-21',
  },
  {
    id: 'leave-2',
    userId: 'user-4',
    employeeName: 'Ananya Deshmukh',
    employeeId: 'EMP-004',
    department: 'Product Design',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    leaveType: 'SICK',
    startDate: '2026-08-24',
    endDate: '2026-08-24',
    totalDays: 1,
    reason: 'Medical appointment for routine dental checkup and rest.',
    status: 'PENDING',
    createdAt: '2026-08-22',
  },
  {
    id: 'leave-3',
    userId: 'user-5',
    employeeName: 'Vikram Malhotra',
    employeeId: 'EMP-005',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    leaveType: 'PAID',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    totalDays: 5,
    reason: 'Independence Day extended week vacation with family to Ladakh.',
    status: 'APPROVED',
    adminRemarks: 'Approved by HR. Have a wonderful trip Vikram!',
    reviewedBy: 'Pooja Iyer (HR)',
    createdAt: '2026-08-01',
  },
  {
    id: 'leave-4',
    userId: 'user-6',
    employeeName: 'Sneha Reddy',
    employeeId: 'EMP-006',
    department: 'Infrastructure',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    leaveType: 'UNPAID',
    startDate: '2026-07-20',
    endDate: '2026-07-21',
    totalDays: 2,
    reason: 'Relocating to new apartment in Hyderabad.',
    status: 'APPROVED',
    adminRemarks: 'Approved by Admin.',
    reviewedBy: 'Aarav Mehta (Admin)',
    createdAt: '2026-07-15',
  }
];

// Helper to generate a realistic 30-day attendance history matrix for all 8 employees
function generate30DayAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const baseDate = new Date('2026-08-22');

  INITIAL_USERS.forEach((user, userIdx) => {
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - dayOffset);
      const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
      const dateStr = d.toISOString().split('T')[0];

      // Skip Sundays
      if (dayOfWeek === 0) continue;

      const isToday = dayOffset === 0;
      let checkIn = '09:05 AM';
      let checkOut: string | null = '06:15 PM';
      let hours = 8.6;
      let status: AttendanceRecord['status'] = 'PRESENT';
      let remarks = 'Regular Shift Complete';
      let locationStatus: AttendanceRecord['locationStatus'] = 'office';
      let distance = 0.03;

      // Realistic variations for employees
      if (isToday) {
        checkIn = userIdx === 4 ? null! : '09:00 AM';
        checkOut = null;
        hours = userIdx === 4 ? 0 : 4.5;
        status = userIdx === 4 ? 'ABSENT' : userIdx === 5 ? 'HALF_DAY' : 'PRESENT';
        remarks = userIdx === 4 ? 'Unscheduled absent' : 'Active shift in progress';
        locationStatus = userIdx === 4 ? 'blocked' : 'office';
        distance = userIdx === 4 ? 14.2 : 0.03;
      } else if (dayOffset % 9 === 0 && userIdx > 1) {
        // Occasional half-day
        checkIn = '09:15 AM';
        checkOut = '01:30 PM';
        hours = 4.25;
        status = 'HALF_DAY';
        remarks = 'Approved half day medical appointment';
      } else if (dayOffset === 12 && userIdx === 4) {
        // Approved leave day
        checkIn = null!;
        checkOut = null;
        hours = 0;
        status = 'LEAVE';
        remarks = 'Independence Day holiday bridge leave';
      } else {
        const randMin = (dayOffset * 7 + userIdx * 11) % 25;
        checkIn = `08:${(45 + (randMin % 15)).toString().padStart(2, '0')} AM`;
        checkOut = `06:${(10 + (randMin % 20)).toString().padStart(2, '0')} PM`;
        hours = +(8.2 + (randMin % 10) * 0.1).toFixed(2);
      }

      records.push({
        id: `att-30d-${user.id}-${dayOffset}`,
        userId: user.id,
        employeeName: `${user.profile.firstName} ${user.profile.lastName}`,
        employeeId: user.employeeId,
        department: user.profile.department,
        date: dateStr,
        checkIn,
        checkOut,
        totalHours: hours,
        status,
        remarks,
        locationStatus,
        geoDistanceKm: distance,
        geoLabel: locationStatus === 'office' ? 'Prestige Tech Park HQ (0.03km)' : 'Remote Location',
        ipAddress: `10.14.20.${100 + userIdx}`,
        deviceFingerprint: `DAYFLOW-SEC-${user.employeeId}`,
      });
    }
  });

  return records;
}

export const INITIAL_ATTENDANCE: AttendanceRecord[] = generate30DayAttendance();

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Salary Statement Credited (August 2026)',
    message: 'Your official monthly compensation statement is generated and credited via NEFT/RTGS.',
    type: 'payroll',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Leave Request Received',
    message: 'Rohan Verma submitted a Paid Leave application for Aug 28-30.',
    type: 'leave',
    timestamp: 'Yesterday',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Tax Declaration Window Open',
    message: 'Submit your Form 12BB investment proofs under the New Tax Regime by month end.',
    type: 'system',
    timestamp: '3 days ago',
    read: true,
  }
];
