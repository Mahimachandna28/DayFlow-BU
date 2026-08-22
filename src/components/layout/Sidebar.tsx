import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserCircle2,
  BarChart3,
  ShieldCheck,
  Briefcase,
  Play,
  Square,
  Coffee,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    leaveRequests,
    activeSession,
    punchIn,
    punchOut,
    toggleBreak,
  } = useApp();

  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const isAdminOrHR = currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users, badge: isAdminOrHR ? 'Admin' : undefined },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    {
      id: 'leaves',
      label: 'Leave & Time-Off',
      icon: CalendarDays,
      badge: isAdminOrHR && pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'payroll', label: 'Payroll & Salary', icon: DollarSign },
    { id: 'profile', label: 'My Profile', icon: UserCircle2 },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* User Role Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
            {isAdminOrHR ? <ShieldCheck className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-400">Current Workspace</p>
            <p className="text-sm font-bold text-white truncate">{currentUser.profile.department}</p>
            <span
              className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded ${
                currentUser.role === 'ADMIN'
                  ? 'bg-purple-500/30 text-purple-300'
                  : currentUser.role === 'HR_OFFICER'
                  ? 'bg-blue-500/30 text-blue-300'
                  : 'bg-emerald-500/30 text-emerald-300'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Punching Card Widget in Sidebar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Quick Clock</span>
          <span
            className={`w-2 h-2 rounded-full ${
              activeSession.isActive
                ? activeSession.isOnBreak
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
                : 'bg-slate-300'
            }`}
          />
        </div>

        {activeSession.isActive ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Status:</span>
              <span className="font-bold text-emerald-600">
                {activeSession.isOnBreak ? '☕ On Break' : '⚡ Punched In'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleBreak}
                className="btn-secondary text-[11px] py-1.5 px-2 w-full justify-center"
              >
                <Coffee className="w-3 h-3" />
                {activeSession.isOnBreak ? 'Resume' : 'Break'}
              </button>
              <button
                onClick={punchOut}
                className="btn-danger text-[11px] py-1.5 px-2 w-full justify-center"
              >
                <Square className="w-3 h-3" />
                Out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={punchIn}
            className="btn-primary w-full text-xs py-2 justify-center shadow-brand-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Punch In Now
          </button>
        )}
      </div>
    </aside>
  );
};
