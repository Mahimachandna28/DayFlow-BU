import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeaveType, LeaveStatus, LeaveRequest } from '../../types';

export const LeaveManagementView: React.FC = () => {
  const {
    currentUser,
    leaveRequests,
    applyLeave,
    reviewLeave,
    addToast,
  } = useApp();

  const isAdminOrHR = currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER';

  // Apply Form State
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('PAID');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Review comments input state
  const [reviewComments, setReviewComments] = useState<{ [key: string]: string }>({});

  // Calculations for employee balances
  const myLeaves = leaveRequests.filter((l) => l.userId === currentUser.id);
  const approvedPaidLeaves = myLeaves
    .filter((l) => l.leaveType === 'PAID' && l.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.totalDays, 0);
  const approvedSickLeaves = myLeaves
    .filter((l) => l.leaveType === 'SICK' && l.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.totalDays, 0);

  const balances = {
    PAID: { used: approvedPaidLeaves, total: 12 },
    SICK: { used: approvedSickLeaves, total: 6 },
    UNPAID: { used: myLeaves.filter((l) => l.leaveType === 'UNPAID' && l.status === 'APPROVED').reduce((acc, curr) => acc + curr.totalDays, 0), total: 30 },
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      addToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) {
      addToast('Invalid Dates', 'End date must be after or equal to start date.', 'error');
      return;
    }

    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    applyLeave({
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    // Reset Form
    setIsApplyOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending">Pending</span>;
      case 'APPROVED':
        return <span className="badge badge-approved">Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'PAID':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Paid Leave</span>;
      case 'SICK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Sick Leave</span>;
      case 'UNPAID':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Unpaid Leave</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px]">{type}</span>;
    }
  };

  // Filter records
  const displayLeaves = isAdminOrHR
    ? leaveRequests
    : leaveRequests.filter((l) => l.userId === currentUser.id);

  const pendingLeaves = displayLeaves.filter((l) => l.status === 'PENDING');
  const pastLeaves = displayLeaves.filter((l) => l.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-brand-600" />
            Leave & Time-Off Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {isAdminOrHR
              ? 'Review pending time-off applications, audit leave usage balances, and authorize requests'
              : 'Submit new time-off applications, check remaining leave balances, and track approvals'}
          </p>
        </div>

        {!isAdminOrHR && (
          <button
            onClick={() => setIsApplyOpen(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold shadow-brand-500/10 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        )}
      </div>

      {/* Employee balances section */}
      {!isAdminOrHR && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-3xl p-5 border border-emerald-200/80 shadow-xs">
            <div className="flex justify-between items-center text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <span>Annual Paid Leaves</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-emerald-950">
                {balances.PAID.total - balances.PAID.used}
              </span>
              <span className="text-xs text-emerald-700/80 font-bold">days left</span>
            </div>
            <p className="text-[10px] text-emerald-800 mt-2 font-medium">
              Used {balances.PAID.used} of {balances.PAID.total} standard days
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100/60 rounded-3xl p-5 border border-rose-200/80 shadow-xs">
            <div className="flex justify-between items-center text-rose-800 font-bold text-xs uppercase tracking-wider">
              <span>Sick / Wellness Leaves</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse-subtle" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-rose-950">
                {balances.SICK.total - balances.SICK.used}
              </span>
              <span className="text-xs text-rose-700/80 font-bold">days left</span>
            </div>
            <p className="text-[10px] text-rose-800 mt-2 font-medium">
              Used {balances.SICK.used} of {balances.SICK.total} health-safety days
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-100 to-slate-200/60 rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center text-slate-800 font-bold text-xs uppercase tracking-wider">
              <span>Unpaid / Casual Leaves</span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-950">
                {balances.UNPAID.used}
              </span>
              <span className="text-xs text-slate-700/80 font-bold">days taken</span>
            </div>
            <p className="text-[10px] text-slate-800 mt-2 font-medium">
              Casual leave does not deduct salary base
            </p>
          </div>
        </div>
      )}

      {/* Main Inbox Queue - Review / Actions */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending Approvals Queue ({pendingLeaves.length})
        </h3>

        {pendingLeaves.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center text-xs text-slate-400 font-semibold">
            All requests cleared! No pending time-off approvals at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-5 transition-all hover:border-slate-300"
              >
                <div className="flex gap-3.5">
                  <img
                    src={leave.avatarUrl}
                    alt={leave.employeeName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{leave.employeeName}</h4>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{leave.employeeId}</span>
                      {getLeaveTypeBadge(leave.leaveType)}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                      Department: {leave.department}
                    </p>
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic">
                      "{leave.reason}"
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-3 font-semibold">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span>
                        {leave.startDate} to {leave.endDate}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold text-[10px]">
                        {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {isAdminOrHR ? (
                  <div className="flex flex-col gap-2.5 w-full md:w-64">
                    <input
                      type="text"
                      placeholder="Add reviewer comments..."
                      value={reviewComments[leave.id] || ''}
                      onChange={(e) =>
                        setReviewComments({ ...reviewComments, [leave.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => reviewLeave(leave.id, 'APPROVED', reviewComments[leave.id])}
                        className="btn-primary py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => reviewLeave(leave.id, 'REJECTED', reviewComments[leave.id])}
                        className="btn-danger py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="self-start">
                    {getStatusBadge(leave.status)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Log */}
      <div className="space-y-4 pt-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Time-Off Activity Logs & History
        </h3>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                  {isAdminOrHR && <th className="p-4 pl-6">Employee</th>}
                  <th className="p-4">Leave Type</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Days</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Review Status</th>
                  <th className="p-4 pr-6">Review Comments / Approver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pastLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminOrHR ? 7 : 6} className="p-6 text-center text-slate-400 font-medium">
                      No historical leave activities logged yet.
                    </td>
                  </tr>
                ) : (
                  pastLeaves.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                      {isAdminOrHR && (
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[9px]">
                              {log.employeeName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{log.employeeName}</p>
                              <p className="text-[8px] text-slate-400 font-mono">{log.employeeId}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="p-4">{getLeaveTypeBadge(log.leaveType)}</td>
                      <td className="p-4 font-mono font-medium text-slate-600">
                        {log.startDate} to {log.endDate}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{log.totalDays} day(s)</td>
                      <td className="p-4 text-slate-600 max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </td>
                      <td className="p-4">{getStatusBadge(log.status)}</td>
                      <td className="p-4 pr-6 text-slate-500">
                        {log.adminRemarks ? (
                          <div className="space-y-0.5">
                            <p className="italic text-slate-600">"{log.adminRemarks}"</p>
                            {log.reviewedBy && (
                              <p className="text-[9px] text-slate-400">Reviewed by {log.reviewedBy}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">--</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Apply Form Modal (Employee Mode) */}
      {isApplyOpen && !isAdminOrHR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" /> Apply for Time-Off
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit a new leave request. It will be routed to your HR operations officer.
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer font-bold text-slate-700"
                >
                  <option value="PAID">PAID LEAVE (Deducted from annual balance)</option>
                  <option value="SICK">SICK LEAVE (For medical conditions)</option>
                  <option value="UNPAID">UNPAID LEAVE (General casual time off)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Remarks</label>
                <textarea
                  placeholder="Provide details about your time off request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
