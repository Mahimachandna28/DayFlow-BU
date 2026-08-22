import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Download,
  Eye,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generatePayslipPDF } from '../../lib/pdfGenerator';
import { User } from '../../types';
import { PayslipPreviewModal } from '../payroll/PayslipPreviewModal';

export const EmployeeDirectoryView: React.FC = () => {
  const { users, currentUser, switchUser, setCurrentView, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeModalUser, setActiveModalUser] = useState<User | null>(null);
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [previewMonth, setPreviewMonth] = useState('August 2026');

  const departments = ['All', 'Engineering', 'Human Resources', 'Product Design', 'Infrastructure'];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.profile.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.profile.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      u.profile.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || u.profile.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Company Employee Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Browse corporate profiles, job assignments, compensation archives, and team statements
          </p>
        </div>

        <span className="badge badge-present">{users.length} Active Members</span>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={user.profile.avatarUrl}
                    alt={user.profile.firstName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {user.profile.firstName} {user.profile.lastName}
                      </h3>
                      {user.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-brand-600">
                      {user.employeeId}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{user.profile.designation}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-800">{user.profile.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-700 truncate max-w-[170px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Monthly Net:</span>
                  <span className="font-bold font-mono text-emerald-600">
                    ₹{user.salary.netSalary.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveModalUser(user)}
                className="text-xs font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Inspect Dossier
              </button>
              <button
                onClick={() => switchUser(user.id)}
                className="btn-primary text-xs py-1.5 px-3 bg-slate-900 hover:bg-slate-800"
              >
                Switch Role <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User Details Modal */}
      {activeModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeModalUser.profile.avatarUrl}
                  alt={activeModalUser.profile.firstName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeModalUser.profile.firstName} {activeModalUser.profile.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeModalUser.employeeId} • {activeModalUser.profile.designation}
                  </p>
                </div>
              </div>
              <span className="badge badge-present">{activeModalUser.role}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-bold text-slate-800">{activeModalUser.profile.department}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-slate-800">{activeModalUser.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                <span className="text-slate-400">Disbursal Account:</span>
                <span className="font-bold font-mono text-slate-800">{activeModalUser.salary.bankAccount} ({activeModalUser.salary.bankName})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                <span className="text-slate-400">Monthly Compensation:</span>
                <span className="font-bold font-mono text-emerald-600">
                  ₹{activeModalUser.salary.netSalary.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Historical Payslips Quick List for Admin */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">
                Issued Compensation Statements
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['August 2026', 'July 2026', 'June 2026', 'May 2026'].map((m) => (
                  <div
                    key={m}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-700">{m}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setPreviewUser(activeModalUser);
                          setPreviewMonth(m);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600"
                        title="Preview Statement"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          generatePayslipPDF(activeModalUser, m);
                          addToast('Statement Exported', `Generated ${m} slip for ${activeModalUser.profile.firstName}`, 'success');
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-brand-600"
                        title="Download PDF"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setPreviewUser(activeModalUser);
                  setPreviewMonth('August 2026');
                }}
                className="btn-secondary text-xs py-2 px-3"
              >
                <FileText className="w-3.5 h-3.5" /> Full Statement Preview
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalUser(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    switchUser(activeModalUser.id);
                    setActiveModalUser(null);
                  }}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Switch into Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Preview Modal */}
      {previewUser && (
        <PayslipPreviewModal
          isOpen={!!previewUser}
          onClose={() => setPreviewUser(null)}
          user={previewUser}
          initialMonth={previewMonth}
        />
      )}
    </div>
  );
};
