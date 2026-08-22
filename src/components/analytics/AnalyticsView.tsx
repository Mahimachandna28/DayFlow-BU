import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Briefcase,
  AlertCircle,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { users, attendanceRecords, leaveRequests, getAttendanceAnomalies } = useApp();

  // Stats Box Calculations
  const headcount = users.length;
  
  // Total monthly payroll expenditure
  const totalPayroll = users.reduce((acc, u) => acc + u.salary.netSalary, 0);

  // Average daily hours worked
  const activeRecords = attendanceRecords.filter((r) => r.totalHours > 0);
  const avgHours = activeRecords.length > 0 
    ? (activeRecords.reduce((acc, r) => acc + r.totalHours, 0) / activeRecords.length).toFixed(1)
    : '8.0';

  // Pending leaves count
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const securityAlerts = getAttendanceAnomalies(attendanceRecords);
  const anomalousRecordIds = new Set(securityAlerts.map((alert) => alert.recordId));
  const cleanShiftScore =
    attendanceRecords.length > 0
      ? Math.max(0, Math.round(((attendanceRecords.length - anomalousRecordIds.size) / attendanceRecords.length) * 100))
      : 100;
  const criticalAlerts = securityAlerts.filter((alert) => alert.severity === 'Critical').length;

  // 1. Chart Data: Department Payroll Distribution
  const deptPayrollMap: { [key: string]: number } = {};
  users.forEach((u) => {
    const dept = u.profile.department || 'General';
    deptPayrollMap[dept] = (deptPayrollMap[dept] || 0) + u.salary.netSalary;
  });

  const payrollChartData = Object.keys(deptPayrollMap).map((dept) => ({
    name: dept,
    value: deptPayrollMap[dept],
  }));

  const COLORS = ['#714B67', '#00A09D', '#0c8ee9', '#f59e0b', '#6366f1'];

  // 2. Chart Data: Attendance Status Rates
  const statusMap: { [key: string]: number } = {
    Present: 0,
    'Half Day': 0,
    Leave: 0,
    Absent: 0,
  };
  attendanceRecords.forEach((r) => {
    if (r.status === 'PRESENT') statusMap['Present']++;
    else if (r.status === 'HALF_DAY') statusMap['Half Day']++;
    else if (r.status === 'LEAVE') statusMap['Leave']++;
    else if (r.status === 'ABSENT') statusMap['Absent']++;
  });

  const attendanceChartData = Object.keys(statusMap).map((status) => ({
    name: status,
    count: statusMap[status],
  }));

  // 3. Chart Data: Weekly average hours trends
  // Construct last 7 dates available in logs or mock weekly stats
  const dateMap: { [key: string]: { sum: number; count: number } } = {};
  attendanceRecords.slice(0, 30).forEach((r) => {
    if (r.totalHours > 0) {
      if (!dateMap[r.date]) dateMap[r.date] = { sum: 0, count: 0 };
      dateMap[r.date].sum += r.totalHours;
      dateMap[r.date].count++;
    }
  });

  const weeklyTrendData = Object.keys(dateMap)
    .sort()
    .slice(-7)
    .map((date) => ({
      date: date.substring(5), // MM-DD
      Hours: Number((dateMap[date].sum / dateMap[date].count).toFixed(1)),
    }));

  // Fallback if data is insufficient for charts
  const defaultWeeklyTrend = weeklyTrendData.length > 0 ? weeklyTrendData : [
    { date: '08-14', Hours: 7.8 },
    { date: '08-15', Hours: 8.2 },
    { date: '08-16', Hours: 8.0 },
    { date: '08-17', Hours: 7.5 },
    { date: '08-18', Hours: 8.5 },
    { date: '08-19', Hours: 8.1 },
    { date: '08-20', Hours: 8.3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            Executive Reports & Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time corporate metrics on employee density, payroll disbursements, and operational timesheets
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Headcount</span>
            <span className="block text-2xl font-black text-slate-800 mt-0.5">{headcount} Staff</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Payroll</span>
            <span className="block text-2xl font-black text-slate-800 mt-0.5">${totalPayroll.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg. Daily Shift</span>
            <span className="block text-2xl font-black text-slate-800 mt-0.5">{avgHours} Hours</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Leaves</span>
            <span className="block text-2xl font-black text-slate-800 mt-0.5">{pendingLeaves} Actions</span>
          </div>
        </div>
      </div>

      {/* AI Security Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Security Anomaly Score
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Percentage of shifts with no detected risk signals</p>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${
                criticalAlerts > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {criticalAlerts} Critical
            </span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900">{cleanShiftScore}%</span>
            <span className="pb-2 text-xs font-bold text-slate-500">clean shifts</span>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${cleanShiftScore >= 80 ? 'bg-emerald-500' : cleanShiftScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${cleanShiftScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-brand-600" />
              AI Security Feed
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Heuristic alerts for late entries, geo breaches, short shifts, and odd-hour sign-ins
            </p>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {securityAlerts.length === 0 ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-xs font-semibold text-emerald-700">
                No attendance anomalies detected in the current dataset.
              </div>
            ) : (
              securityAlerts.slice(0, 8).map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-3.5 ${
                    alert.severity === 'Critical'
                      ? 'border-rose-200 bg-rose-50'
                      : alert.severity === 'Warning'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            alert.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-700'
                              : alert.severity === 'Warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">{alert.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-snug">{alert.detail}</p>
                      <p className="mt-1 text-[10px] font-mono text-slate-400">
                        {alert.employeeId} / {alert.date}
                      </p>
                    </div>
                    {alert.title === 'Geo-fence Breach' ? (
                      <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Graphs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department payroll budget pie */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Monthly Payroll Budget Allocation</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Net compensation distributed across departments (USD)</p>
          </div>
          <div className="h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payrollChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {payrollChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString()} USD` : ''} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Workforce Shift Status Count</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Summary of attendance statuses logged in records</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#00A09D" radius={[6, 6, 0, 0]}>
                  {attendanceChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Present' ? '#10b981' : entry.name === 'Half Day' ? '#f59e0b' : entry.name === 'Leave' ? '#8b5cf6' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Avg Working Hours Line Graph */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 lg:col-span-2">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Daily Working Hours Trend
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Average active duty hours recorded per shift day</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultWeeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Hours"
                  stroke="#714B67"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
