# Dayflow — Human Resource Management System (HRMS)
> *"Every workday, perfectly aligned."*

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/kriti768/DayFlow-BU)
[![Stack](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20TailwindCSS-0c8ee9)](https://github.com/kriti768/DayFlow-BU)
[![UI Standard](https://img.shields.io/badge/Design-Odoo%20%2F%20Linear%20Aesthetic-714b67)](https://github.com/kriti768/DayFlow-BU)

Dayflow is a modern, enterprise-grade Human Resource Management System (HRMS) built for hackathons and high-speed organizational operations. It digitizes and aligns core HR workflows: **role-based authentication**, **interactive employee dashboards**, **real-time attendance tracking with live work clocks**, **leave approvals**, **transparent salary structures with dynamic PDF payslip generation**, and **executive analytics**.

---

## 🌟 Hackathon Winning Highlights & Features

1. **⚡ 1-Click Role Switcher Demo Bar:**
   - Evaluators and judges can switch viewpoints instantly between **Admin / HR Officer (Alex Morgan)** and **Employees (Liam Chen, Sophia Taylor, etc.)** without re-logging in.
2. **⏱ Real-Time Active Attendance Clock:**
   - Start shift, take break, punch out, and track live active hours with auto half-day/full-day status calculations.
3. **📄 1-Click Automated PDF Payslip Generator:**
   - Dynamic client-side salary statement generator with company branding, tax breakdown (TDS, PF, HRA), direct deposit details, and HR signature stamps.
4. **📊 Analytics & Business Intelligence Dashboard:**
   - Interactive charts for weekly attendance trends, department payroll allocation, and leave category breakdown powered by Recharts.
5. **🎉 Instant Leave Approvals with Feedback & Confetti:**
   - Admin inbox with real-time approvals, rejections, custom HR notes, and celebration particle feedback.

---

## 👥 2-Person Work Division

| Developer | Role & Responsibilities |
| :--- | :--- |
| **Developer 1 (Backend & Data Contracts)** | Database Schema (PostgreSQL/Prisma), RBAC Middleware, Attendance Engine & API endpoints, Leave deduction workflows, and Payroll calculations. |
| **Developer 2 (Frontend Architecture & UI/UX)** | Design System, App Shell, 1-Click Demo Bar, Employee/Admin Dashboards, Attendance View, Leave Modals, PDF Generator, Charts, and State Management. |

---

## 🛠 Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + PostCSS + Plus Jakarta Sans Typography
- **Icons:** Lucide React
- **Charts & Data Viz:** Recharts
- **Document Generation:** jsPDF + jspdf-autotable
- **State & Persistence:** React Context API + LocalStorage state persistence + Real-time toaster system
- **Animations & Delight:** Canvas-Confetti

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/kriti768/DayFlow-BU.git
cd DayFlow-BU
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for production
```bash
npm run build
```

---

## 📋 Feature Breakdown (Problem Statement Mapping)

### 3.1 Authentication & Authorization
- Sign up with Employee ID, Email, Password, and Role selection (`Employee` vs `HR Officer` vs `Admin`).
- Sign in with credentials, validation, and demo 1-click profiles.

### 3.2 Dashboards
- **Employee Dashboard (3.2.1):** Quick-access cards (Profile, Attendance, Leave Requests, Salary), live punching clock, time-off balances, and document downloads.
- **Admin/HR Dashboard (3.2.2):** Total workforce headcount, present today percentage, pending approvals queue, payroll totals, and 1-click employee switcher.

### 3.3 Employee Profile Management
- **View Profile (3.3.1):** Personal details, Job hierarchy, Salary structure, and Verified personnel documents.
- **Edit Profile (3.3.2):** Strict role-based permissions (Employees can only edit phone, address, and profile picture; Admins can edit all company attributes).

### 3.4 Attendance Management
- Daily and weekly attendance logs with status chips: `PRESENT`, `ABSENT`, `HALF_DAY`, and `LEAVE`.
- Role-gated visibility: Employees view personal attendance; Admins view and override records across all departments.

### 3.5 Leave & Time-Off Management
- Employee time-off application with auto-calculated duration, leave type selection (`Paid`, `Sick`, `Unpaid`), and remarks.
- Admin approvals inbox with 1-click Approve/Reject, comments, and real-time record updates.

### 3.6 Payroll / Salary Management
- Employee read-only salary breakdown (Basic, HRA, Allowances, Deductions, Net Payout).
- Admin payroll control to adjust salary structures and generate downloadable PDF payslips.

---

## 📂 Project Architecture

```
DayFlow-BU/
├── public/
├── src/
│   ├── components/
│   │   ├── analytics/        # Recharts BI dashboard
│   │   ├── attendance/       # Daily & weekly timesheets & overrides
│   │   ├── auth/             # Sign-in & register modal with demo pills
│   │   ├── common/           # Toast notifications & UI widgets
│   │   ├── dashboard/        # Employee & Admin command centers
│   │   ├── employees/        # Searchable directory & inspection modals
│   │   ├── layout/           # Navbar (Demo switcher) & Sidebar
│   │   ├── leave/            # Leave application & Admin approvals hub
│   │   ├── payroll/          # Salary breakdown & admin controls
│   │   └── profile/          # Profile view & role-gated edit modal
│   ├── context/              # Central AppContext state & storage sync
│   ├── lib/
│   │   ├── mockData.ts       # Rich 8-user company seed dataset
│   │   └── pdfGenerator.ts   # jsPDF salary statement generator
│   ├── types/                # TypeScript domain interfaces
│   ├── App.tsx               # Root view router
│   ├── index.css             # Tailwind base & custom components
│   └── main.tsx              # Application entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License
MIT License. Built for hackathons and modern workforce teams.
