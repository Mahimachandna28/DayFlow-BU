import React, { useState } from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    attendanceRecords,
    leaveRequests,
    reviewLeave,
    switchUser,
    setCurrentView,
    addToast,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState('All');
  const [remarksInput, setRemarksInput] = useState<{ [key: string]: string }>({});

  // Pagination states
  const [leavePage, setLeavePage] = useState(1);
  const leavePageSize = 3;

  const [empPage, setEmpPage] = useState(1);
  const empPageSize = 6;

  // Key KPI metrics
  const totalEmployees = users.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const presentToday = todayRecords.filter((r) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING');
  const totalMonthlyPayroll = users.reduce((acc, u) => acc + u.salary.netSalary, 0);

  const departments = ['All', 'Executive HR', 'Engineering', 'Human Resources', 'Product Design', 'Infrastructure'];

  const filteredEmployees = users.filter((u) => {
    if (selectedDept === 'All') return true;
    return u.profile.department === selectedDept;
  });

  // Paginated Slices
  const totalLeavePages = Math.ceil(pendingLeaves.length / leavePageSize) || 1;
  const paginatedLeaves = pendingLeaves.slice((leavePage - 1) * leavePageSize, leavePage * leavePageSize);

  const totalEmpPages = Math.ceil(filteredEmployees.length / empPageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice((empPage - 1) * empPageSize, empPage * empPageSize);

  const handleApprove = (leaveId: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    const remark = remarksInput[leaveId] || 'Approved by HR Administrator';
    reviewLeave(leaveId, 'APPROVED', remark);
  };

  const handleReject = (leaveId: string) => {
    const remark = remarksInput[leaveId] || 'Declined due to coverage constraints';
    reviewLeave(leaveId, 'REJECTED', remark);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Management Console
            </span>
            <span className="text-xs text-slate-400">Dayflow HRMS v2.4 (India)</span>
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mt-2">
            HR Command & Executive Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Real-time workforce intelligence, time-off approvals, and company-wide attendance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto relative z-10">
          <button
            onClick={() => setCurrentView('employees')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all flex items-center gap-2"
          >
            <Users className="w-3.5 h-3.5" /> Manage Employees
          </button>
          <button
            onClick={() => setCurrentView('payroll')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            <IndianRupee className="w-3.5 h-3.5" /> Payroll Hub
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Employees */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Headcount</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{totalEmployees}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              100% verified Indian roster
            </p>
          </div>
        </div>

        {/* Metric 2: Present Today */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Present Today</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{presentToday}</span>
              <span className="text-xs font-semibold text-slate-400">/ {totalEmployees}</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {Math.round((presentToday / totalEmployees) * 100)}% active attendance rate
            </p>
          </div>
        </div>

        {/* Metric 3: Pending Approvals */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Leave Queue</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-600">{pendingLeaves.length}</div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              Requires HR review & decision
            </p>
          </div>
        </div>

        {/* Metric 4: Total Payroll Expense */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Monthly Net Payroll</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">
              ₹{totalMonthlyPayroll.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Disbursed via automated NEFT / RTGS
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Pending Leave Approvals Action Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-brand-600" />
              Pending Leave Approvals Inbox
            </h2>
            <p className="text-xs text-slate-500">
              Approve or decline employee time-off requests with custom feedback
            </p>
          </div>
          <span className="badge badge-pending">
            {pendingLeaves.length} Action{pendingLeaves.length === 1 ? '' : 's'} Required
          </span>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">All leave requests reviewed!</p>
            <p className="text-[11px] text-slate-400">No pending time-off requests in the inbox.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-300"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={leave.avatarUrl}
                    alt={leave.employeeName}
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{leave.employeeName}</h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {leave.employeeId}
                      </span>
                      <span className="badge badge-present text-[10px]">{leave.department}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="font-semibold text-brand-600">
                        {leave.leaveType} Leave
                      </span>
                      <span>•</span>
                      <span>
                        {leave.startDate} to {leave.endDate} ({leave.totalDays} day{leave.totalDays > 1 ? 's' : ''})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 bg-white p-2.5 rounded-xl border border-slate-200/80 italic">
                      "{leave.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[240px]">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Optional HR feedback remark..."
                      value={remarksInput[leave.id] || ''}
                      onChange={(e) =>
                        setRemarksInput({ ...remarksInput, [leave.id]: e.target.value })
                      }
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(leave.id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination for Leaves */}
            {totalLeavePages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                <span>
                  Showing {(leavePage - 1) * leavePageSize + 1} to{' '}
                  {Math.min(leavePage * leavePageSize, pendingLeaves.length)} of {pendingLeaves.length} requests
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLeavePage((p) => Math.max(1, p - 1))}
                    disabled={leavePage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-bold text-slate-800">
                    Page {leavePage} of {totalLeavePages}
                  </span>
                  <button
                    onClick={() => setLeavePage((p) => Math.min(totalLeavePages, p + 1))}
                    disabled={leavePage === totalLeavePages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Employee List & Quick Switching */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Workforce Directory & Quick Switch</h2>
            <p className="text-xs text-slate-500">
              Browse team members, switch viewpoints, and review records
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setEmpPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEmployees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3">
                <img
                  src={emp.profile.avatarUrl}
                  alt={emp.profile.firstName}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {emp.profile.firstName} {emp.profile.lastName}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {emp.employeeId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{emp.profile.designation}</p>
                  <p className="text-[11px] font-semibold text-brand-600 mt-0.5">
                    {emp.profile.department}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  ₹{emp.salary.netSalary.toLocaleString('en-IN')}
                  <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                </span>
                <button
                  onClick={() => switchUser(emp.id)}
                  className="text-xs font-bold text-brand-600 group-hover:text-brand-700 flex items-center gap-1 hover:underline"
                >
                  View as User <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination for Workforce Grid */}
        {totalEmpPages > 1 && (
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {(empPage - 1) * empPageSize + 1} to{' '}
              {Math.min(empPage * empPageSize, filteredEmployees.length)} of {filteredEmployees.length} staff
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEmpPage((p) => Math.max(1, p - 1))}
                disabled={empPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-slate-800">
                Page {empPage} of {totalEmpPages}
              </span>
              <button
                onClick={() => setEmpPage((p) => Math.min(totalEmpPages, p + 1))}
                disabled={empPage === totalEmpPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
