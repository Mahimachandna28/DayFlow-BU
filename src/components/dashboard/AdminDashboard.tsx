import React, { useState } from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  DollarSign,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Filter,
  Search,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    leaveRequests,
    attendanceRecords,
    reviewLeave,
    switchUser,
    setCurrentView,
    addToast,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [remarksInput, setRemarksInput] = useState<{ [id: string]: string }>({});

  // Summary Metrics
  const totalEmployees = users.length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING');
  
  // Today's attendance
  const todayStr = '2026-08-22';
  const todayAttendance = attendanceRecords.filter((r) => r.date === todayStr);
  const presentToday = todayAttendance.filter((r) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
  const onLeaveToday = todayAttendance.filter((r) => r.status === 'LEAVE').length + leaveRequests.filter(l => l.status === 'APPROVED' && l.startDate <= todayStr && l.endDate >= todayStr).length;

  const totalMonthlyPayroll = users.reduce((acc, curr) => acc + curr.salary.netSalary, 0);

  const departments = ['All', 'Engineering', 'Human Resources', 'Product Design', 'Infrastructure'];

  const filteredEmployees =
    selectedDept === 'All' ? users : users.filter((u) => u.profile.department === selectedDept);

  const handleApprove = (leaveId: string) => {
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
            <span className="text-xs text-slate-400">Dayflow HRMS v2.4</span>
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
            <DollarSign className="w-3.5 h-3.5" /> Payroll Hub
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
              +2 onboarded this quarter
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
            <span className="text-xs font-bold text-slate-500">Monthly Payroll Run</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">
              ${totalMonthlyPayroll.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Disbursed via automated direct deposit
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
            {pendingLeaves.map((leave) => (
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
                      <span className="text-xs text-slate-400">({leave.employeeId})</span>
                      <span className="badge badge-pending">{leave.leaveType} LEAVE</span>
                    </div>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">
                      {leave.startDate} → {leave.endDate} • {leave.totalDays} day(s)
                    </p>
                    <p className="text-xs text-slate-600 mt-1 bg-white p-2 rounded-xl border border-slate-200/60 max-w-xl">
                      "{leave.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <div className="w-full sm:w-56">
                    <input
                      type="text"
                      placeholder="Add HR comment..."
                      value={remarksInput[leave.id] || ''}
                      onChange={(e) =>
                        setRemarksInput({ ...remarksInput, [leave.id]: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(leave.id)}
                      className="btn-danger text-xs py-2 px-3 justify-center"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="btn-primary text-xs py-2 px-4 justify-center bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employee List & Quick Switching (Section 3.2.2) */}
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
                onClick={() => setSelectedDept(dept)}
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
          {filteredEmployees.map((emp) => (
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
                  ${emp.salary.netSalary.toLocaleString()}
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
      </div>
    </div>
  );
};
