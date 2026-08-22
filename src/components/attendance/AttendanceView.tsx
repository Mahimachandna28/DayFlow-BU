import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Calendar,
  Edit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock3,
  CalendarDays,
  User,
  Coffee,
  MapPin,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus, MockLocationStatus } from '../../types';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    attendanceRecords,
    updateAttendanceRecord,
    activeSession,
    punchIn,
    punchOut,
    toggleBreak,
    mockLocationStatus,
  } = useApp();

  const isAdminOrHR = currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER';

  // State for filtering & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit fields state
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('PRESENT');
  const [editRemarks, setEditRemarks] = useState('');
  const locationMeta: Record<
    MockLocationStatus,
    { label: string; distance: string; className: string; dotClassName: string }
  > = {
    office: {
      label: 'At Office HQ',
      distance: '0.03 km from HQ',
      className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dotClassName: 'bg-emerald-500',
    },
    remote: {
      label: 'Remote / Out of Bounds',
      distance: '5.4 km from HQ',
      className: 'text-rose-700 bg-rose-50 border-rose-200',
      dotClassName: 'bg-rose-500',
    },
    blocked: {
      label: 'Disabled / Denied',
      distance: 'GPS unavailable',
      className: 'text-amber-700 bg-amber-50 border-amber-200',
      dotClassName: 'bg-amber-500',
    },
  };
  const activeLocationMeta = locationMeta[mockLocationStatus];

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter((record) => {
    const isEmployeeRecord = !isAdminOrHR ? record.userId === currentUser.id : true;
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || record.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;

    return isEmployeeRecord && matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate stats
  const totalRecords = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.status === 'PRESENT').length;
  const halfDayCount = filteredRecords.filter((r) => r.status === 'HALF_DAY').length;
  const leaveCount = filteredRecords.filter((r) => r.status === 'LEAVE').length;
  const absentCount = filteredRecords.filter((r) => r.status === 'ABSENT').length;

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditCheckIn(record.checkIn || '');
    setEditCheckOut(record.checkOut || '');
    setEditStatus(record.status);
    setEditRemarks(record.remarks || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    // Calculate simulated hours based on time strings if provided
    let calcHours = editingRecord.totalHours;
    if (editCheckIn && editCheckOut) {
      try {
        const [inH, inM] = editCheckIn.split(':').map(Number);
        const [outH, outM] = editCheckOut.split(':').map(Number);
        if (!isNaN(inH) && !isNaN(outH)) {
          const diffMin = (outH * 60 + outM) - (inH * 60 + inM);
          if (diffMin > 0) calcHours = Number((diffMin / 60).toFixed(2));
        }
      } catch (e) {
        // Fallback to previous
      }
    }

    updateAttendanceRecord(editingRecord.id, {
      checkIn: editCheckIn || null,
      checkOut: editCheckOut || null,
      status: editStatus,
      remarks: editRemarks,
      totalHours: calcHours,
    });

    setEditingRecord(null);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <span className="badge badge-present">Present</span>;
      case 'HALF_DAY':
        return <span className="badge badge-half-day">Half Day</span>;
      case 'LEAVE':
        return <span className="badge badge-leave">Leave</span>;
      case 'ABSENT':
        return <span className="badge badge-absent">Absent</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const hasGeoBreach = (record: AttendanceRecord) =>
    (record.geoDistanceKm ?? 0) > 0.5 || Boolean(record.remarks?.includes('[Geo Breach]'));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-brand-600 animate-pulse-subtle" />
            Attendance Tracking
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {isAdminOrHR
              ? 'Review workforce shift timings, check-ins, and override timesheet exceptions'
              : 'Punch in/out, check active work duration, and review personal attendance logs'}
          </p>
        </div>

        {/* Live Punch Widget for Employees inside Attendance View */}
        {!isAdminOrHR && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-left">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">
                Shift Duration
              </span>
              <span className="font-mono text-base font-bold text-slate-800">
                {activeSession.isActive ? formatTime(activeSession.elapsedSeconds) : '00:00:00'}
              </span>
              <div
                className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${activeLocationMeta.className}`}
                title="Current mock geolocation used for the next punch-in"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeLocationMeta.dotClassName}`}></span>
                <MapPin className="w-3 h-3" />
                <span>{activeLocationMeta.label}</span>
                <span className="font-mono opacity-80">{activeLocationMeta.distance}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {activeSession.isActive ? (
                <>
                  <button onClick={toggleBreak} className="btn-secondary py-1.5 px-3 text-xs">
                    <Coffee className="w-3.5 h-3.5" />
                    {activeSession.isOnBreak ? 'Resume' : 'Break'}
                  </button>
                  <button onClick={punchOut} className="btn-danger py-1.5 px-3 text-xs">
                    Punch Out
                  </button>
                </>
              ) : (
                <button onClick={punchIn} className="btn-primary py-1.5 px-4 text-xs">
                  Punch In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Corporate Summary Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Logs</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{totalRecords}</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <div className="text-emerald-600/80 text-[10px] font-bold uppercase tracking-wider">Present</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{presentCount}</div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="text-amber-600/80 text-[10px] font-bold uppercase tracking-wider">Half Day</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{halfDayCount}</div>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <div className="text-purple-600/80 text-[10px] font-bold uppercase tracking-wider">Leaves</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">{leaveCount}</div>
        </div>
        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
          <div className="text-rose-600/80 text-[10px] font-bold uppercase tracking-wider">Absent</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{absentCount}</div>
        </div>
      </div>

      {/* Filtering panel */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter (Admin-only) */}
          {isAdminOrHR && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-xs text-slate-600 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product Design">Product Design</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-600 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                {isAdminOrHR && <th className="p-4 pl-6">Employee</th>}
                <th className="p-4">Date</th>
                <th className="p-4">Check-In</th>
                <th className="p-4">Check-Out</th>
                <th className="p-4">Active Hours</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notes & Exceptions</th>
                {isAdminOrHR && <th className="p-4 pr-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrHR ? 8 : 6} className="p-8 text-center text-slate-400 font-medium">
                    No attendance logs match the current filters.
                  </td>
                </tr>
              ) : (
                filteredRecords
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((record) => {
                  const isGeoBreach = hasGeoBreach(record);
                  return (
                  <tr
                    key={record.id}
                    className={`transition-colors ${
                      isGeoBreach
                        ? 'bg-rose-50/50 hover:bg-rose-50 border-l-4 border-l-rose-500'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {isAdminOrHR && (
                      <td className="p-4 pl-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px]">
                            {record.employeeName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{record.employeeName}</p>
                            <p className="text-[9px] text-slate-400 font-mono">{record.employeeId}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4 font-mono font-medium text-slate-600">{record.date}</td>
                    <td className="p-4 text-slate-700">{record.checkIn || '--'}</td>
                    <td className="p-4 text-slate-700">{record.checkOut || '--'}</td>
                    <td className="p-4 font-semibold text-slate-800">
                      {record.totalHours > 0 ? `${record.totalHours.toFixed(1)} hrs` : '--'}
                    </td>
                    <td className="p-4">{getStatusBadge(record.status)}</td>
                    <td className="p-4 text-slate-500 max-w-xs" title={record.remarks}>
                      <div className="flex flex-col gap-1.5">
                        {isGeoBreach && (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                            <ShieldAlert className="w-3 h-3" />
                            Geo Breach
                          </span>
                        )}
                        {record.geoDistanceKm !== undefined && record.geoDistanceKm !== null && (
                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isGeoBreach ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            {record.geoDistanceKm.toFixed(1)} km from HQ
                          </span>
                        )}
                        {record.locationStatus === 'blocked' && (
                          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <MapPin className="w-3 h-3" />
                            GPS unavailable
                          </span>
                        )}
                        <span className="italic truncate">{record.remarks || '--'}</span>
                      </div>
                    </td>
                    {isAdminOrHR && (
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-all"
                          title="Override attendance data"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Show rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-xs"
            >
              <option value={10}>10 records</option>
              <option value={20}>20 records</option>
              <option value={50}>50 records</option>
            </select>
            <span className="text-slate-400">
              (Total {filteredRecords.length} logs)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 mr-1">
              Page <strong>{currentPage}</strong> of <strong>{Math.ceil(filteredRecords.length / pageSize) || 1}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(Math.ceil(filteredRecords.length / pageSize) || 1, p + 1)
                )
              }
              disabled={currentPage >= (Math.ceil(filteredRecords.length / pageSize) || 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Override Edit Modal (Admin-only Drawer style) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Override Attendance Record</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjusting punch parameters for {editingRecord.employeeName} on {editingRecord.date}
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-In Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-Out Time</label>
                  <input
                    type="text"
                    placeholder="06:00 PM"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attendance Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer font-bold text-slate-700"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="HALF_DAY">HALF_DAY</option>
                  <option value="LEAVE">LEAVE</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">HR Admin Override Notes</label>
                <textarea
                  placeholder="Reason for timesheet adjustments..."
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4 text-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
