import React, { useState } from 'react';
import {
  Clock,
  Play,
  Square,
  Coffee,
  Calendar,
  IndianRupee,
  User,
  ArrowRight,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Sparkles,
  Download,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generatePayslipPDF } from '../../lib/pdfGenerator';
import { PayslipPreviewModal } from '../payroll/PayslipPreviewModal';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    activeSession,
    punchIn,
    punchOut,
    toggleBreak,
    attendanceRecords,
    leaveRequests,
    setCurrentView,
    addToast,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // User's recent attendance records
  const myAttendance = attendanceRecords.filter((r) => r.userId === currentUser.id);
  const presentDays = myAttendance.filter((r) => r.status === 'PRESENT').length;
  const halfDays = myAttendance.filter((r) => r.status === 'HALF_DAY').length;

  // User's leave requests
  const myLeaves = leaveRequests.filter((l) => l.userId === currentUser.id);
  const approvedLeavesCount = myLeaves
    .filter((l) => l.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.totalDays, 0);
  const remainingLeaveDays = Math.max(0, 18 - approvedLeavesCount); // 18 standard annual days

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.profile.avatarUrl}
              alt={currentUser.profile.firstName}
              className="w-16 h-16 rounded-2xl ring-4 ring-white/10 shadow-lg object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight">
                  Welcome back, {currentUser.profile.firstName}! 👋
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/20">
                  {currentUser.profile.designation}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                {currentUser.employeeId} • {currentUser.profile.department} • Member since{' '}
                {currentUser.profile.dateOfJoining}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Pay Period Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 focus:outline-none focus:ring-1 focus:ring-brand-400"
            >
              <option value="August 2026" className="bg-slate-900 text-white">August 2026 (Latest)</option>
              <option value="July 2026" className="bg-slate-900 text-white">July 2026</option>
              <option value="June 2026" className="bg-slate-900 text-white">June 2026</option>
              <option value="May 2026" className="bg-slate-900 text-white">May 2026</option>
            </select>

            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Preview
            </button>

            <button
              onClick={() => {
                generatePayslipPDF(currentUser, selectedMonth);
                addToast('Payslip Downloaded', `Official statement for ${selectedMonth} downloaded.`, 'success');
              }}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              1-Click Download
            </button>
          </div>
        </div>
      </div>

      <PayslipPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        user={currentUser}
        initialMonth={selectedMonth}
      />

      {/* Main Grid: Live Clock-In Widget + Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Clock Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Live Attendance Clock
              </h2>
              <span
                className={`badge ${
                  activeSession.isActive
                    ? activeSession.isOnBreak
                      ? 'badge-half-day'
                      : 'badge-present'
                    : 'badge-absent'
                }`}
              >
                {activeSession.isActive
                  ? activeSession.isOnBreak
                    ? 'Break'
                    : 'Active'
                  : 'Checked Out'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>

            {/* Big Digital Timer Display */}
            <div className="my-6 p-6 rounded-2xl bg-slate-900 text-center shadow-inner relative overflow-hidden">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                {activeSession.isOnBreak ? 'Pause Duration' : 'Total Work Time'}
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                {activeSession.isActive ? formatTime(activeSession.elapsedSeconds) : '00:00:00'}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Standard shift: 8.00 hrs target</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {activeSession.isActive ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={toggleBreak}
                  className="btn-secondary py-3 text-xs font-bold justify-center"
                >
                  <Coffee className="w-4 h-4 text-amber-600" />
                  {activeSession.isOnBreak ? 'Resume Work' : 'Take Break'}
                </button>
                <button
                  onClick={punchOut}
                  className="btn-danger py-3 text-xs font-bold justify-center shadow-rose-600/20"
                >
                  <Square className="w-4 h-4" />
                  Punch Out
                </button>
              </div>
            ) : (
              <button
                onClick={punchIn}
                className="btn-primary w-full py-3.5 text-sm font-bold justify-center shadow-brand-600/30"
              >
                <Play className="w-4 h-4 fill-current" />
                Punch In (Start Shift)
              </button>
            )}
          </div>
        </div>

        {/* 4 Quick Access Cards & Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Leave Balance */}
          <div
            onClick={() => setCurrentView('leaves')}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm card-hover cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                Apply <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{remainingLeaveDays}</span>
                <span className="text-xs font-semibold text-slate-500">/ 18 days remaining</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">Paid Time-Off Balance</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {approvedLeavesCount} days taken this year ({myLeaves.filter((l) => l.status === 'PENDING').length} pending approval)
              </p>
            </div>
          </div>

          {/* Card 2: Attendance Rate */}
          <div
            onClick={() => setCurrentView('attendance')}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm card-hover cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                Details <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">98.5%</span>
                <span className="text-xs font-semibold text-emerald-600">On Track</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">Attendance Consistency</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {presentDays} Full Days • {halfDays} Half Days logged
              </p>
            </div>
          </div>

          {/* Card 3: Next Salary Payout */}
          <div
            onClick={() => setCurrentView('payroll')}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm card-hover cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                Payslips <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  ₹{currentUser.salary.netSalary.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">INR</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">Net Monthly Compensation</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                NEFT/RTGS to {currentUser.salary.bankName}
              </p>
            </div>
          </div>

          {/* Card 4: Profile & Documents */}
          <div
            onClick={() => setCurrentView('profile')}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm card-hover cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <User className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                Edit Profile <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {currentUser.profile.documents.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">Verified Files</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">Official Credentials</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Contract, Tax Forms & ID Badge available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Leave Requests + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Leave Applications</h3>
              <p className="text-xs text-slate-500">Your recent time-off requests and approval status</p>
            </div>
            <button
              onClick={() => setCurrentView('leaves')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {myLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No leave applications filed yet.</p>
            ) : (
              myLeaves.slice(0, 3).map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{leave.leaveType} LEAVE</span>
                      <span
                        className={`badge ${
                          leave.status === 'APPROVED'
                            ? 'badge-approved'
                            : leave.status === 'PENDING'
                            ? 'badge-pending'
                            : 'badge-rejected'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {leave.startDate} to {leave.endDate} ({leave.totalDays} day{leave.totalDays > 1 ? 's' : ''})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{leave.reason}</p>
                  </div>
                  {leave.adminRemarks && (
                    <span className="text-[11px] text-slate-500 italic max-w-xs text-right hidden sm:block">
                      "{leave.adminRemarks}"
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Access Documents & Policy */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Company Documents & Policy</h3>
                <p className="text-xs text-slate-500">Instant access to your employment assets</p>
              </div>
              <Sparkles className="w-4 h-4 text-brand-600" />
            </div>

            <div className="space-y-2.5">
              {currentUser.profile.documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => addToast('Document Downloaded', `Opening ${doc.name}`, 'info')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-4 h-4 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {doc.type} • {doc.size} • Uploaded {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-brand-50 border border-brand-100 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <p className="text-[11px] text-brand-900 leading-snug">
              Need salary revisions or emergency time-off? Connect directly with HR via the{' '}
              <button
                onClick={() => setCurrentView('leaves')}
                className="font-bold underline cursor-pointer"
              >
                Time-Off Hub
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
