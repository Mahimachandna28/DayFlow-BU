import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { EmployeeDirectoryView } from './components/employees/EmployeeDirectoryView';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/Toast';

// Missing views that we will implement next
import { AttendanceView } from './components/attendance/AttendanceView';
import { LeaveManagementView } from './components/leave/LeaveManagementView';
import { PayrollView } from './components/payroll/PayrollView';
import { ProfileView } from './components/profile/ProfileView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AICopilotModal } from './components/ai/AICopilotModal';

const AppContent: React.FC = () => {
  const { currentView, currentUser } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER' ? (
          <AdminDashboard />
        ) : (
          <EmployeeDashboard />
        );
      case 'employees':
        return <EmployeeDirectoryView />;
      case 'attendance':
        return <AttendanceView />;
      case 'leaves':
        return <LeaveManagementView />;
      case 'payroll':
        return <PayrollView />;
      case 'profile':
        return <ProfileView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER' ? (
          <AdminDashboard />
        ) : (
          <EmployeeDashboard />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main Core Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Sidebar navigation */}
        <Sidebar />

        {/* Content Panel */}
        <main className="flex-1 min-w-0 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Auth & Account Selector Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* AI Smart HR Copilot & Statutory Assistant */}
      <AICopilotModal />

      {/* Sonner-style custom Toast alerts */}
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
