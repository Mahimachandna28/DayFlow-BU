import React, { useState } from 'react';
import {
  Bell,
  Check,
  RotateCcw,
  Sparkles,
  Users,
  ChevronDown,
  Clock,
  LogOut,
  Calendar,
  DollarSign,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const {
    currentUser,
    users,
    notifications,
    activeSession,
    switchUser,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllData,
    setCurrentView,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      {/* 1-Click Hackathon Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-semibold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3" /> Hackathon Demo Switcher
          </span>
          <span className="hidden md:inline text-slate-400">Quick-switch roles to test permissions & workflows:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {users.slice(0, 4).map((user) => {
            const isActive = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm ring-1 ring-white/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <img
                  src={user.profile.avatarUrl}
                  alt={user.profile.firstName}
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span>{user.profile.firstName}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-900/60 text-purple-200'
                      : user.role === 'HR_OFFICER'
                      ? 'bg-blue-900/60 text-blue-200'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'ADMIN' : user.role === 'HR_OFFICER' ? 'HR' : 'EMP'}
                </span>
              </button>
            );
          })}

          <button
            onClick={resetAllData}
            title="Restore default test data"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <span className="font-extrabold text-lg tracking-tight">D</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Day<span className="text-brand-600">flow</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                HRMS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Every workday, perfectly aligned.</p>
          </div>
        </div>

        {/* Live Work Timer Chip (If Checked In) */}
        {activeSession.isActive && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-sm animate-pulse-subtle">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {activeSession.isOnBreak ? 'On Break' : 'Active Duty'}:{' '}
              <span className="font-mono text-emerald-900 font-bold">
                {formatTime(activeSession.elapsedSeconds)}
              </span>
            </span>
          </div>
        )}

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-fadeIn">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                    <p className="text-xs text-slate-500">{unreadCount} unread alerts</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${
                          !notif.read ? 'bg-brand-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'leave'
                              ? 'bg-amber-100 text-amber-700'
                              : notif.type === 'payroll'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-brand-100 text-brand-700'
                          }`}
                        >
                          {notif.type === 'leave' ? (
                            <Calendar className="w-4 h-4" />
                          ) : notif.type === 'payroll' ? (
                            <DollarSign className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            >
              <img
                src={currentUser.profile.avatarUrl}
                alt={currentUser.profile.firstName}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.profile.firstName} {currentUser.profile.lastName}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{currentUser.profile.designation}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">Signed in as</p>
                  <p className="text-xs font-bold text-brand-600 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Role: {currentUser.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentView('profile');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('attendance');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Attendance Records
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('payroll');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Salary & Payslips
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuth();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Sign In / Switch Account
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      resetAllData();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Reset Demo Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
