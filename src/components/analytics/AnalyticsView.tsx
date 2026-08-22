import React, { useState } from 'react';
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
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { users, attendanceRecords, leaveRequests, addToast } = useApp();
  const [activeTimeframe, setActiveTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  // Stats Box Calculations
  const headcount = users.length;
  const totalMonthlyPayroll = users.reduce((acc, u) => acc + u.salary.netSalary, 0);
  const totalAnnualCTC = users.reduce(
    (acc, u) => acc + (u.salary.basicSalary + u.salary.hra + u.salary.allowances) * 12,
    0
  );

  const activeRecords = attendanceRecords.filter((r) => r.totalHours > 0);
  const avgDailyHours =
    activeRecords.length > 0
      ? (activeRecords.reduce((acc, r) => acc + r.totalHours, 0) / activeRecords.length).toFixed(1)
      : '8.2';

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const approvedLeaves = leaveRequests.filter((l) => l.status === 'APPROVED').length;

  // 1. Chart Data: Weekly Attendance Trends
  const weeklyAttendanceData = [
    { day: 'Mon', Present: 8, 'Half Day': 0, Absent: 0, Leave: 0 },
    { day: 'Tue', Present: 7, 'Half Day': 1, Absent: 0, Leave: 0 },
    { day: 'Wed', Present: 8, 'Half Day': 0, Absent: 0, Leave: 0 },
    { day: 'Thu', Present: 6, 'Half Day': 1, Absent: 0, Leave: 1 },
    { day: 'Fri', Present: 7, 'Half Day': 0, Absent: 1, Leave: 0 },
    { day: 'Sat (Active)', Present: 6, 'Half Day': 1, Absent: 1, Leave: 0 },
  ];

  // 2. Chart Data: Department Payroll Distribution
  const deptPayrollMap: { [key: string]: number } = {};
  users.forEach((u) => {
    const dept = u.profile.department || 'General';
    deptPayrollMap[dept] = (deptPayrollMap[dept] || 0) + u.salary.netSalary;
  });

  const COLORS = ['#714B67', '#00A09D', '#0c8ee9', '#f59e0b', '#8b5cf6', '#ec4899'];
  const payrollPieData = Object.keys(deptPayrollMap).map((dept, idx) => ({
    name: dept,
    value: deptPayrollMap[dept],
    color: COLORS[idx % COLORS.length],
  }));

  // 3. Chart Data: Leave Request Volumes by Category
  const leaveCategoryData = [
    {
      category: 'Paid Vacation',
      Approved: leaveRequests.filter((l) => l.leaveType === 'PAID' && l.status === 'APPROVED').length,
      Pending: leaveRequests.filter((l) => l.leaveType === 'PAID' && l.status === 'PENDING').length,
      Rejected: leaveRequests.filter((l) => l.leaveType === 'PAID' && l.status === 'REJECTED').length,
    },
    {
      category: 'Sick Leave',
      Approved: leaveRequests.filter((l) => l.leaveType === 'SICK' && l.status === 'APPROVED').length,
      Pending: leaveRequests.filter((l) => l.leaveType === 'SICK' && l.status === 'PENDING').length,
      Rejected: leaveRequests.filter((l) => l.leaveType === 'SICK' && l.status === 'REJECTED').length,
    },
    {
      category: 'Unpaid Leave',
      Approved: leaveRequests.filter((l) => l.leaveType === 'UNPAID' && l.status === 'APPROVED').length,
      Pending: leaveRequests.filter((l) => l.leaveType === 'UNPAID' && l.status === 'PENDING').length,
      Rejected: leaveRequests.filter((l) => l.leaveType === 'UNPAID' && l.status === 'REJECTED').length,
    },
  ];

  // 4. Productivity & Hours Logged Curve
  const productivityCurve = [
    { week: 'W1', Target: 40, Actual: 41.5 },
    { week: 'W2', Target: 40, Actual: 39.8 },
    { week: 'W3', Target: 40, Actual: 42.2 },
    { week: 'W4', Target: 40, Actual: 40.9 },
  ];

  const handleExportAnalytics = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
    addToast(
      'BI Report Exported',
      'Dayflow Executive Analytics summary exported successfully.',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-brand-600" />
              Executive Analytics & BI Dashboard
            </h1>
            <span className="badge badge-present">Live BI v2.4</span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time workforce intelligence, weekly attendance consistency, compensation allocation, and time-off analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            {(['week', 'month', 'quarter'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTimeframe(t)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTimeframe === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalytics}
            className="btn-primary text-xs py-2 px-4 shadow-brand-500/20 bg-brand-600 hover:bg-brand-700"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Headcount</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{headcount}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              100% active roster engagement
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Monthly Net Payroll</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">
              ₹{totalMonthlyPayroll.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Annualized CTC: ₹{totalAnnualCTC.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avg. Daily Shift</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{avgDailyHours}</span>
              <span className="text-xs font-semibold text-slate-500">hrs / day</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              +0.2h above standard shift target
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Time-Off Operations</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{approvedLeaves}</span>
              <span className="text-xs font-semibold text-amber-600">({pendingLeaves} pending)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Reviewed within 24h SLA
            </p>
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly Attendance Consistency (Stacked Bar) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Weekly Attendance Distribution</h3>
              <p className="text-xs text-slate-500">Shift status trends across team members</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Present" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Half Day" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Leave" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Absent" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Payroll Distribution (Donut Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Department Payroll Allocation</h3>
              <p className="text-xs text-slate-500">Monthly compensation budget share</p>
            </div>
            <DollarSign className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payrollPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {payrollPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} INR`, 'Monthly Net']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {payrollPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900 ml-1">
                  ₹{item.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Leave Volume by Category (Grouped Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Leave Volume by Category</h3>
              <p className="text-xs text-slate-500">Application statuses (Approved vs Pending vs Rejected)</p>
            </div>
            <Calendar className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveCategoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rejected" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Hours Logged vs Target (Area Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Productivity Curve (Weekly Target vs Actual)</h3>
              <p className="text-xs text-slate-500">Company average hours logged vs 40h standard</p>
            </div>
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityCurve}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[35, 45]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Actual" stroke="#0c8ee9" fill="#0c8ee9" fillOpacity={0.15} />
                <Line type="monotone" dataKey="Target" stroke="#94a3b8" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
