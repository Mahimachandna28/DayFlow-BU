import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Role,
  Profile,
  SalaryStructure,
  AttendanceRecord,
  LeaveRequest,
  NotificationItem,
  ActiveWorkSession,
  LeaveType,
  LeaveStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_NOTIFICATIONS,
} from '../lib/mockData';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: User;
  users: User[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  notifications: NotificationItem[];
  activeSession: ActiveWorkSession;
  toasts: ToastMessage[];
  currentView: string;
  setCurrentView: (view: string) => void;
  // Auth & Demo switcher
  switchUser: (userId: string) => void;
  login: (emailOrEmpId: string, role?: Role) => boolean;
  register: (userData: {
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    department: string;
    designation: string;
  }) => boolean;
  logout: () => void;
  // Attendance actions
  punchIn: () => void;
  punchOut: () => void;
  toggleBreak: () => void;
  updateAttendanceRecord: (recordId: string, updates: Partial<AttendanceRecord>) => void;
  // Leave actions
  applyLeave: (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => void;
  reviewLeave: (leaveId: string, status: LeaveStatus, adminRemarks?: string) => void;
  // Profile & Payroll
  updateProfile: (userId: string, updates: Partial<Profile>) => void;
  updateSalary: (userId: string, updates: Partial<SalaryStructure>) => void;
  // Notifications & UI
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'dayflow_users_v1',
  CURRENT_USER_ID: 'dayflow_current_user_id_v1',
  ATTENDANCE: 'dayflow_attendance_v1',
  LEAVES: 'dayflow_leaves_v1',
  NOTIFICATIONS: 'dayflow_notifs_v1',
  SESSION: 'dayflow_session_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or mock defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || INITIAL_USERS[2].id; // Default to Liam Chen (Employee) for rich experience
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVES);
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeSession, setActiveSession] = useState<ActiveWorkSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved
      ? JSON.parse(saved)
      : {
          isActive: true,
          startTime: Date.now() - 4 * 3600 * 1000, // 4 hours ago for demo
          elapsedSeconds: 14400,
          isOnBreak: false,
          breakStartTime: null,
          totalBreakSeconds: 0,
        };
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(activeSession));
  }, [activeSession]);

  // Live timer interval for active work session
  useEffect(() => {
    let interval: any = null;
    if (activeSession.isActive && !activeSession.isOnBreak) {
      interval = setInterval(() => {
        setActiveSession((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession.isActive, activeSession.isOnBreak]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Toast Helpers
  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth / Switcher
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      addToast('Switched Profile', `Now viewing Dayflow as ${target.profile.firstName} (${target.role})`, 'info');
    }
  };

  const login = (emailOrEmpId: string, role?: Role): boolean => {
    const query = emailOrEmpId.trim().toLowerCase();
    const user = users.find(
      (u) => u.email.toLowerCase() === query || u.employeeId.toLowerCase() === query
    );
    if (user) {
      setCurrentUserId(user.id);
      addToast('Welcome Back', `Logged in as ${user.profile.firstName} ${user.profile.lastName}`);
      return true;
    }
    // Fallback: If not found, create or select first with matching role
    if (role) {
      const matchRole = users.find((u) => u.role === role);
      if (matchRole) {
        setCurrentUserId(matchRole.id);
        addToast('Welcome Back', `Logged in as ${matchRole.profile.firstName} (${matchRole.role})`);
        return true;
      }
    }
    addToast('Login Failed', 'Invalid credentials or employee ID', 'error');
    return false;
  };

  const register = (userData: {
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    department: string;
    designation: string;
  }): boolean => {
    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      employeeId: userData.employeeId || `EMP-${100 + users.length}`,
      email: userData.email,
      role: userData.role,
      isVerified: true,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: '+1 (555) 000-1122',
        address: '100 Tech Blvd, Innovation City',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.firstName}`,
        department: userData.department || 'Engineering',
        designation: userData.designation || 'Specialist',
        dateOfJoining: new Date().toISOString().split('T')[0],
        employeeId: userData.employeeId || `EMP-${100 + users.length}`,
        email: userData.email,
        documents: [],
      },
      salary: {
        basicSalary: 5500,
        hra: 2200,
        allowances: 1200,
        deductions: 1100,
        netSalary: 7800,
        currency: 'USD',
        effectiveFrom: new Date().toISOString().split('T')[0],
        bankAccount: '•••• •••• •••• 1234',
        bankName: 'Global City Bank',
        panOrTaxId: `US-TX-${Math.floor(1000000 + Math.random() * 9000000)}`,
      },
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(id);
    addToast('Account Created', `Welcome to Dayflow, ${userData.firstName}!`);
    return true;
  };

  const logout = () => {
    addToast('Logged Out', 'You have been signed out successfully.', 'info');
  };

  // Attendance Workflows
  const punchIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    setActiveSession({
      isActive: true,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isOnBreak: false,
      breakStartTime: null,
      totalBreakSeconds: 0,
    });

    // Check if record exists for today
    setAttendanceRecords((prev) => {
      const existing = prev.find((r) => r.userId === currentUser.id && r.date === todayStr);
      if (existing) {
        return prev.map((r) =>
          r.id === existing.id ? { ...r, checkIn: timeStr, status: 'PRESENT' as const } : r
        );
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          userId: currentUser.id,
          employeeName: `${currentUser.profile.firstName} ${currentUser.profile.lastName}`,
          employeeId: currentUser.employeeId,
          department: currentUser.profile.department,
          date: todayStr,
          checkIn: timeStr,
          checkOut: null,
          totalHours: 0.1,
          status: 'PRESENT',
          remarks: 'Standard check-in',
        };
        return [newRecord, ...prev];
      }
    });

    addToast('Punched In', `Clock started at ${timeStr}. Have a productive day!`);
  };

  const punchOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];
    const totalHours = Number((activeSession.elapsedSeconds / 3600).toFixed(2));

    setActiveSession({
      isActive: false,
      startTime: null,
      elapsedSeconds: 0,
      isOnBreak: false,
      breakStartTime: null,
      totalBreakSeconds: 0,
    });

    setAttendanceRecords((prev) => {
      return prev.map((r) => {
        if (r.userId === currentUser.id && r.date === todayStr) {
          const status = totalHours < 4.0 ? ('HALF_DAY' as const) : ('PRESENT' as const);
          return {
            ...r,
            checkOut: timeStr,
            totalHours: totalHours || 8.0,
            status,
          };
        }
        return r;
      });
    });

    addToast('Punched Out', `Clock stopped at ${timeStr}. Total time: ${totalHours} hrs.`);
  };

  const toggleBreak = () => {
    if (!activeSession.isActive) return;
    if (activeSession.isOnBreak) {
      // End break
      setActiveSession((prev) => ({
        ...prev,
        isOnBreak: false,
        breakStartTime: null,
      }));
      addToast('Break Ended', 'Resumed active work session.', 'info');
    } else {
      // Start break
      setActiveSession((prev) => ({
        ...prev,
        isOnBreak: true,
        breakStartTime: Date.now(),
      }));
      addToast('On Break', 'Clock is paused during your break.', 'warning');
    }
  };

  const updateAttendanceRecord = (recordId: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, ...updates } : r))
    );
    addToast('Attendance Updated', 'Record updated successfully.');
  };

  // Leave Workflows
  const applyLeave = (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => {
    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: currentUser.id,
      employeeName: `${currentUser.profile.firstName} ${currentUser.profile.lastName}`,
      employeeId: currentUser.employeeId,
      department: currentUser.profile.department,
      avatarUrl: currentUser.profile.avatarUrl,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      reason: data.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests((prev) => [newLeave, ...prev]);

    // Send notification to Admin
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Leave Application',
      message: `${currentUser.profile.firstName} applied for ${data.totalDays} day(s) of ${data.leaveType} leave.`,
      type: 'leave',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast('Leave Applied', `Request submitted for ${data.totalDays} day(s). Status: PENDING.`);
  };

  const reviewLeave = (leaveId: string, status: LeaveStatus, adminRemarks?: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => {
        if (l.id === leaveId) {
          return {
            ...l,
            status,
            adminRemarks: adminRemarks || (status === 'APPROVED' ? 'Approved by HR' : 'Declined by HR'),
            reviewedBy: `${currentUser.profile.firstName} (${currentUser.role})`,
          };
        }
        return l;
      })
    );

    if (status === 'APPROVED') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
      addToast('Leave Approved', 'The leave request has been approved and records updated.');
    } else {
      addToast('Leave Rejected', 'The leave request has been declined.', 'warning');
    }
  };

  // Profile & Payroll
  const updateProfile = (userId: string, updates: Partial<Profile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            profile: {
              ...u.profile,
              ...updates,
            },
          };
        }
        return u;
      })
    );
    addToast('Profile Updated', 'Changes have been saved successfully.');
  };

  const updateSalary = (userId: string, updates: Partial<SalaryStructure>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const currentSalary = u.salary;
          const basic = updates.basicSalary ?? currentSalary.basicSalary;
          const hra = updates.hra ?? currentSalary.hra;
          const allowances = updates.allowances ?? currentSalary.allowances;
          const deductions = updates.deductions ?? currentSalary.deductions;
          const netSalary = basic + hra + allowances - deductions;

          return {
            ...u,
            salary: {
              ...currentSalary,
              ...updates,
              netSalary,
            },
          };
        }
        return u;
      })
    );
    addToast('Salary Structure Updated', 'New compensation details are now in effect.');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('Notifications Cleared', 'All marked as read.', 'info');
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[2].id);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveSession({
      isActive: true,
      startTime: Date.now() - 4 * 3600 * 1000,
      elapsedSeconds: 14400,
      isOnBreak: false,
      breakStartTime: null,
      totalBreakSeconds: 0,
    });
    addToast('Demo Data Reset', 'Restored pristine demo state for live pitch.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        attendanceRecords,
        leaveRequests,
        notifications,
        activeSession,
        toasts,
        currentView,
        setCurrentView,
        switchUser,
        login,
        register,
        logout,
        punchIn,
        punchOut,
        toggleBreak,
        updateAttendanceRecord,
        applyLeave,
        reviewLeave,
        updateProfile,
        updateSalary,
        markNotificationRead,
        markAllNotificationsRead,
        addToast,
        removeToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
