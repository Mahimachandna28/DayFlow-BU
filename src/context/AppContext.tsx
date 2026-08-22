import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Role,
  Profile,
  SalaryStructure,
  AttendanceRecord,
  AttendanceStatus,
  MockLocationStatus,
  LeaveRequest,
  NotificationItem,
  ActiveWorkSession,
  LeaveType,
  LeaveStatus,
  SecurityAlert,
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
  mockLocationStatus: MockLocationStatus;
  toasts: ToastMessage[];
  currentView: string;
  setCurrentView: (view: string) => void;
  setMockLocationStatus: (status: MockLocationStatus) => void;
  getAttendanceAnomalies: (records?: AttendanceRecord[]) => SecurityAlert[];
  // Auth & Demo switcher
  switchUser: (userId: string) => void;
  login: (emailOrEmpId: string, role?: Role) => Promise<boolean>;
  register: (userData: {
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    department: string;
    designation: string;
  }) => Promise<boolean>;
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
  USERS: 'dayflow_users_in_v2',
  CURRENT_USER_ID: 'dayflow_current_user_id_in_v2',
  ATTENDANCE: 'dayflow_attendance_in_v2',
  LEAVES: 'dayflow_leaves_in_v2',
  NOTIFICATIONS: 'dayflow_notifs_in_v2',
  SESSION: 'dayflow_session_in_v2',
  MOCK_LOCATION: 'dayflow_mock_location_in_v2',
};

const GEO_PROFILES: Record<
  MockLocationStatus,
  { label: string; distanceKm: number | null; remarks: string }
> = {
  office: {
    label: 'At Office HQ',
    distanceKm: 0.03,
    remarks: 'HQ verified check-in',
  },
  remote: {
    label: 'Remote / Out of Bounds',
    distanceKm: 5.4,
    remarks: '[Geo Breach] Outside company perimeter - 5.4 km from HQ',
  },
  blocked: {
    label: 'Disabled / Denied',
    distanceKm: null,
    remarks: '[GPS Warning] Location sensor unavailable or permission denied',
  },
};

const parseTimeToMinutes = (time: string | null): number | null => {
  if (!time) return null;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export const getAttendanceAnomalies = (records: AttendanceRecord[] = []): SecurityAlert[] => {
  const alerts: SecurityAlert[] = [];

  records.forEach((record) => {
    const checkInMinutes = parseTimeToMinutes(record.checkIn);
    const distance = record.geoDistanceKm ?? null;

    if (checkInMinutes !== null && checkInMinutes > 10 * 60) {
      alerts.push({
        id: `${record.id}-late`,
        recordId: record.id,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        date: record.date,
        title: 'Late Arrival',
        detail: `${record.employeeName} checked in at ${record.checkIn}, after the 10:00 AM threshold.`,
        severity: 'Warning',
      });
    }

    if (record.totalHours > 0 && record.totalHours < 5.0) {
      alerts.push({
        id: `${record.id}-short-shift`,
        recordId: record.id,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        date: record.date,
        title: 'Short Shift',
        detail: `${record.employeeName} recorded ${record.totalHours.toFixed(1)} active hours.`,
        severity: 'Info',
      });
    }

    if (distance !== null && distance > 0.5) {
      alerts.push({
        id: `${record.id}-geo`,
        recordId: record.id,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        date: record.date,
        title: 'Geo-fence Breach',
        detail: `${record.employeeName} punched in ${distance.toFixed(1)} km from Office HQ.`,
        severity: 'Critical',
      });
    }

    if (checkInMinutes !== null && (checkInMinutes >= 22 * 60 || checkInMinutes < 5 * 60)) {
      alerts.push({
        id: `${record.id}-odd-hour`,
        recordId: record.id,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        date: record.date,
        title: 'Odd-Hour Sign-in',
        detail: `${record.employeeName} signed in at ${record.checkIn}, outside standard operating hours.`,
        severity: 'Critical',
      });
    }
  });

  return alerts.sort((a, b) => {
    const severityRank: Record<SecurityAlert['severity'], number> = {
      Critical: 0,
      Warning: 1,
      Info: 2,
    };
    return severityRank[a.severity] - severityRank[b.severity] || b.date.localeCompare(a.date);
  });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or mock defaults
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('dayflow_auth_token');
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || INITIAL_USERS[2].id; // Default to Liam Chen
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [activeSession, setActiveSession] = useState<ActiveWorkSession>({
    isActive: true,
    startTime: Date.now() - 4 * 3600 * 1000, // 4 hours ago for demo
    elapsedSeconds: 14400,
    isOnBreak: false,
    breakStartTime: null,
    totalBreakSeconds: 0,
    locationStatus: 'office',
    geoDistanceKm: 0.03,
  });

  const [mockLocationStatus, setMockLocationStatusState] = useState<MockLocationStatus>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_LOCATION) as MockLocationStatus | null;
    return saved && ['office', 'remote', 'blocked'].includes(saved) ? saved : 'office';
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // API Fetch Helper
  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const currentToken = localStorage.getItem('dayflow_auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...(options.headers || {}),
    };
    const response = await fetch(`http://localhost:5000${path}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  };

  // Application Data Loader
  const loadAppData = async (currentToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${currentToken}` };
      
      const meRes = await fetch('http://localhost:5000/api/auth/me', { headers }).then(r => r.json());
      if (meRes.success) {
        setCurrentUserId(meRes.user.id);
      } else {
        throw new Error(meRes.message);
      }

      const [usersRes, attendanceRes, leavesRes, notifsRes, sessionRes] = await Promise.all([
        fetch('http://localhost:5000/api/users', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/attendance', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/leaves', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/notifications', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/attendance/session', { headers }).then(r => r.json()),
      ]);

      if (usersRes.success) setUsers(usersRes.users);
      if (attendanceRes.success) setAttendanceRecords(attendanceRes.records);
      if (leavesRes.success) setLeaveRequests(leavesRes.leaves);
      if (notifsRes.success) setNotifications(notifsRes.notifications);
      if (sessionRes.success) setActiveSession(sessionRes.session);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setToken(null);
      localStorage.removeItem('dayflow_auth_token');
    }
  };

  useEffect(() => {
    if (token) {
      loadAppData(token);
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOCK_LOCATION, mockLocationStatus);
  }, [mockLocationStatus]);

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

  const setMockLocationStatus = (status: MockLocationStatus) => {
    setMockLocationStatusState(status);
    const profile = GEO_PROFILES[status];
    addToast('Location Simulator Updated', `${profile.label} selected for punch testing.`, 'info');
  };

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
  const switchUser = async (userId: string) => {
    try {
      const res = await apiFetch('/api/auth/switch', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      if (res.success) {
        setToken(res.token);
        localStorage.setItem('dayflow_auth_token', res.token);
        addToast('Switched Profile', `Now viewing Dayflow as ${res.user.profile.firstName} (${res.user.role})`, 'info');
      }
    } catch (err: any) {
      addToast('Profile Switch Failed', err.message || 'Failed to switch profile', 'error');
    }
  };

  const login = async (emailOrEmpId: string, role?: Role): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrEmpId, password: 'password123' }), // Seeded users password
      });
      if (res.success) {
        setToken(res.token);
        localStorage.setItem('dayflow_auth_token', res.token);
        addToast('Welcome Back', `Logged in as ${res.user.profile.firstName} ${res.user.profile.lastName}`);
        return true;
      }
    } catch (err: any) {
      addToast('Login Failed', err.message || 'Invalid credentials or employee ID', 'error');
    }
    return false;
  };

  const register = async (userData: {
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    department: string;
    designation: string;
  }): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          password: 'password123', // default registration password
        }),
      });
      if (res.success) {
        setToken(res.token);
        localStorage.setItem('dayflow_auth_token', res.token);
        addToast('Account Created', `Welcome to Dayflow, ${userData.firstName}!`);
        return true;
      }
    } catch (err: any) {
      addToast('Registration Failed', err.message || 'Failed to register account', 'error');
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('dayflow_auth_token');
    addToast('Logged Out', 'You have been signed out successfully.', 'info');
  };

  // Attendance Workflows (Optimistic + Backend Sync)
  const punchIn = async () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const geoProfile = GEO_PROFILES[mockLocationStatus] || GEO_PROFILES.office;

    // 1. Optimistic Local State Update
    setActiveSession({
      isActive: true,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isOnBreak: false,
      breakStartTime: null,
      totalBreakSeconds: 0,
      locationStatus: mockLocationStatus,
      geoDistanceKm: geoProfile.distanceKm,
    });

    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.userId === currentUser.id && r.date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          checkIn: timeStr,
          status: 'PRESENT',
          remarks: geoProfile.remarks,
          locationStatus: mockLocationStatus,
          geoDistanceKm: geoProfile.distanceKm,
          geoLabel: geoProfile.label,
        };
        return updated;
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
          remarks: geoProfile.remarks,
          locationStatus: mockLocationStatus,
          geoDistanceKm: geoProfile.distanceKm,
          geoLabel: geoProfile.label,
        };
        return [newRecord, ...prev];
      }
    });

    if (mockLocationStatus === 'remote') {
      addToast('Geo-fence Warning', 'Warning: Punching from outside company perimeter.', 'warning');
    } else if (mockLocationStatus === 'blocked') {
      addToast('GPS Warning', 'Punch logged, but location sensor was unavailable.', 'warning');
    } else {
      addToast('Punched In', 'Clock started. Have a productive workday!');
    }

    // 2. Background API Sync
    try {
      const res = await apiFetch('/api/attendance/punch-in', {
        method: 'POST',
        body: JSON.stringify({ locationStatus: mockLocationStatus }),
      });
      if (res?.success && res.session) {
        setActiveSession(res.session);
      }
    } catch (err) {
      console.log('Background punch-in sync notice:', err);
    }
  };

  const punchOut = async () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const finalHours = Math.max(0.1, +(activeSession.elapsedSeconds / 3600).toFixed(2));
    const status: AttendanceStatus = finalHours < 4.0 ? 'HALF_DAY' : 'PRESENT';

    // 1. Optimistic Local State Update
    setActiveSession({
      isActive: false,
      startTime: null,
      elapsedSeconds: 0,
      isOnBreak: false,
      breakStartTime: null,
      totalBreakSeconds: 0,
      locationStatus: activeSession.locationStatus,
      geoDistanceKm: activeSession.geoDistanceKm,
    });

    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.userId === currentUser.id && r.date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          checkOut: timeStr,
          totalHours: finalHours,
          status,
        };
        return updated;
      }
      return prev;
    });

    addToast('Punched Out', `Clock stopped. Total shift: ${finalHours} hrs.`);

    // 2. Background API Sync
    try {
      await apiFetch('/api/attendance/sync-timer', {
        method: 'POST',
        body: JSON.stringify({ elapsedSeconds: activeSession.elapsedSeconds }),
      });
      await apiFetch('/api/attendance/punch-out', { method: 'POST' });
    } catch (err) {
      console.log('Background punch-out sync notice:', err);
    }
  };

  const toggleBreak = async () => {
    const now = Date.now();
    const isEnteringBreak = !activeSession.isOnBreak;

    // 1. Optimistic Local State Update
    if (isEnteringBreak) {
      setActiveSession((prev) => ({
        ...prev,
        isOnBreak: true,
        breakStartTime: now,
      }));
      addToast('On Break', 'Clock is paused during your break.', 'warning');
    } else {
      const breakSecs = activeSession.breakStartTime
        ? Math.floor((now - activeSession.breakStartTime) / 1000)
        : 0;
      setActiveSession((prev) => ({
        ...prev,
        isOnBreak: false,
        breakStartTime: null,
        totalBreakSeconds: prev.totalBreakSeconds + (breakSecs > 0 ? breakSecs : 0),
      }));
      addToast('Break Ended', 'Resumed active work session.', 'info');
    }

    // 2. Background API Sync
    try {
      await apiFetch('/api/attendance/sync-timer', {
        method: 'POST',
        body: JSON.stringify({ elapsedSeconds: activeSession.elapsedSeconds }),
      });
      await apiFetch('/api/attendance/toggle-break', { method: 'POST' });
    } catch (err) {
      console.log('Background break sync notice:', err);
    }
  };

  const updateAttendanceRecord = async (recordId: string, updates: Partial<AttendanceRecord>) => {
    try {
      const res = await apiFetch(`/api/attendance/${recordId}/override`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.success) {
        setAttendanceRecords((prev) => prev.map((r) => (r.id === recordId ? res.record : r)));
        addToast('Attendance Updated', 'Record updated successfully.');
      }
    } catch (err: any) {
      addToast('Attendance Update Failed', err.message || 'Failed to update attendance', 'error');
    }
  };

  // Leave Workflows
  const applyLeave = async (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => {
    try {
      const res = await apiFetch('/api/leaves/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.success) {
        setLeaveRequests((prev) => [res.leave, ...prev]);

        // Refresh notifications
        const notifsRes = await apiFetch('/api/notifications');
        if (notifsRes.success) setNotifications(notifsRes.notifications);

        addToast('Leave Applied', `Request submitted for ${data.totalDays} day(s). Status: PENDING.`);
      }
    } catch (err: any) {
      addToast('Leave Request Failed', err.message || 'Failed to apply leave', 'error');
    }
  };

  const reviewLeave = async (leaveId: string, status: LeaveStatus, adminRemarks?: string) => {
    try {
      const res = await apiFetch(`/api/leaves/${leaveId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, adminRemarks }),
      });
      if (res.success) {
        setLeaveRequests((prev) => prev.map((l) => (l.id === leaveId ? res.leave : l)));

        // Refresh notifications
        const notifsRes = await apiFetch('/api/notifications');
        if (notifsRes.success) setNotifications(notifsRes.notifications);

        if (status === 'APPROVED') {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {}
          addToast('Leave Approved', 'The leave request has been approved and records updated.');
        } else {
          addToast('Leave Rejected', 'The leave request has been declined.', 'warning');
        }
      }
    } catch (err: any) {
      addToast('Leave Review Failed', err.message || 'Failed to review leave', 'error');
    }
  };

  // Profile & Payroll
  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    try {
      const res = await apiFetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, profile: res.profile } : u)));
        addToast('Profile Updated', 'Changes have been saved successfully.');
      }
    } catch (err: any) {
      addToast('Profile Update Failed', err.message || 'Failed to update profile', 'error');
    }
  };

  const updateSalary = async (userId: string, updates: Partial<SalaryStructure>) => {
    try {
      const res = await apiFetch(`/api/users/${userId}/salary`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, salary: res.salary } : u)));
        addToast('Salary Structure Updated', 'New compensation details are now in effect.');
      }
    } catch (err: any) {
      addToast('Salary Update Failed', err.message || 'Failed to update salary', 'error');
    }
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (res.success) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? res.notification : n)));
      }
    } catch (err: any) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await apiFetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        addToast('Notifications Cleared', 'All marked as read.', 'info');
      }
    } catch (err: any) {
      addToast('Failed to clear notifications', err.message || 'API request failed', 'error');
    }
  };

  const resetAllData = async () => {
    try {
      const res = await apiFetch('/api/reset', {
        method: 'POST',
      });
      if (res.success) {
        addToast('Demo Data Reset', 'Restored database seed records.', 'info');
        if (token) {
          loadAppData(token);
        } else {
          // Switch to user-3 (Rohan Verma) demo user by default on reset
          const switchRes = await fetch('http://localhost:5000/api/auth/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-3' }),
          }).then((r) => r.json());
          if (switchRes.success) {
            setToken(switchRes.token);
            localStorage.setItem('dayflow_auth_token', switchRes.token);
          }
        }
      }
    } catch (err: any) {
      addToast('Reset Failed', err.message || 'Failed to reset demo data', 'error');
    }
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
        mockLocationStatus,
        toasts,
        currentView,
        setCurrentView,
        setMockLocationStatus,
        getAttendanceAnomalies,
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
