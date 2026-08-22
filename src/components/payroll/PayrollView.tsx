import React, { useState } from 'react';
import {
  DollarSign,
  Download,
  Edit2,
  Coins,
  Receipt,
  PiggyBank,
  Percent,
  Search,
  Filter,
  CheckCircle,
  Eye,
  Mail,
  Package,
  Sparkles,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { generatePayslipPDF } from '../../lib/pdfGenerator';
import { User, SalaryStructure } from '../../types';
import { PayslipPreviewModal } from './PayslipPreviewModal';

export const PayrollView: React.FC = () => {
  const { currentUser, users, updateSalary, addToast } = useApp();

  const isAdminOrHR = currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER';

  // Admin states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isBulkEmailing, setIsBulkEmailing] = useState(false);

  // Preview Modal state
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [previewMonth, setPreviewMonth] = useState('August 2026');

  // Edit fields state
  const [editBasic, setEditBasic] = useState<number>(0);
  const [editHra, setEditHra] = useState<number>(0);
  const [editAllowances, setEditAllowances] = useState<number>(0);
  const [editDeductions, setEditDeductions] = useState<number>(0);
  const [editBank, setEditBank] = useState('');
  const [editBankName, setEditBankName] = useState('');

  // Filtered employees for admin
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profile.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || u.profile.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditBasic(user.salary.basicSalary);
    setEditHra(user.salary.hra);
    setEditAllowances(user.salary.allowances);
    setEditDeductions(user.salary.deductions);
    setEditBank(user.salary.bankAccount);
    setEditBankName(user.salary.bankName);
  };

  const handleSaveSalary = (e: React.FormEvent, userId: string) => {
    e.preventDefault();

    updateSalary(userId, {
      basicSalary: editBasic,
      hra: editHra,
      allowances: editAllowances,
      deductions: editDeductions,
      bankAccount: editBank,
      bankName: editBankName,
    });

    setEditingUserId(null);
  };

  // Bulk Operations
  const handleBulkGenerate = () => {
    setIsBulkGenerating(true);
    let count = 0;
    const interval = setInterval(() => {
      if (count < users.length) {
        generatePayslipPDF(users[count], 'August 2026');
        count++;
      } else {
        clearInterval(interval);
        setIsBulkGenerating(false);
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
        addToast(
          'Batch Generation Complete',
          `Generated and downloaded ${users.length} official payslips.`,
          'success'
        );
      }
    }, 200);
  };

  const handleBulkEmail = () => {
    setIsBulkEmailing(true);
    setTimeout(() => {
      setIsBulkEmailing(false);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
      addToast(
        'Payroll Disbursed via Email',
        `Dispatched digital payslip statements to all ${users.length} employee mailboxes.`,
        'success'
      );
    }, 1200);
  };

  // Salary components for current user (Employee View)
  const basic = currentUser.salary.basicSalary;
  const hra = currentUser.salary.hra;
  const allowances = currentUser.salary.allowances;
  const deductions = currentUser.salary.deductions;
  const gross = basic + hra + allowances;
  const net = currentUser.salary.netSalary;

  // Historical months for payslip demo
  const payslipCycles = [
    { id: 'cycle-1', month: 'August 2026', status: 'PAID', reference: `PAY-202608-${currentUser.employeeId}` },
    { id: 'cycle-2', month: 'July 2026', status: 'PAID', reference: `PAY-202607-${currentUser.employeeId}` },
    { id: 'cycle-3', month: 'June 2026', status: 'PAID', reference: `PAY-202606-${currentUser.employeeId}` },
    { id: 'cycle-4', month: 'May 2026', status: 'PAID', reference: `PAY-202605-${currentUser.employeeId}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-brand-600" />
            Payroll & Salary Center
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {isAdminOrHR
              ? 'Manage corporate compensation scales, verify banking routes, and issue corporate PDF payslips'
              : 'Review salary structures, earnings statements, deductions breakdown, and download historical payslips'}
          </p>
        </div>

        {isAdminOrHR ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleBulkEmail}
              disabled={isBulkEmailing}
              className="btn-secondary text-xs py-2.5 px-3.5"
            >
              <Send className="w-3.5 h-3.5 text-brand-600" />
              {isBulkEmailing ? 'Disbursing...' : 'Email Slips to All'}
            </button>
            <button
              onClick={handleBulkGenerate}
              disabled={isBulkGenerating}
              className="btn-primary text-xs py-2.5 px-4 bg-brand-600 hover:bg-brand-700 shadow-brand-600/20"
            >
              <Package className="w-3.5 h-3.5" />
              {isBulkGenerating ? 'Generating Batch...' : `Batch Generate All (${users.length})`}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setPreviewUser(currentUser);
              setPreviewMonth('August 2026');
            }}
            className="btn-primary text-xs py-2.5 px-4 shadow-brand-600/20"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview & Download Payslip
          </button>
        )}
      </div>

      {/* ADMIN VIEW: Master Payroll Table */}
      {isAdminOrHR ? (
        <div className="space-y-4">
          {/* Filtering panel */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-xs text-slate-600 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Executive HR">Executive HR</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product Design">Product Design</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    <th className="p-4 pl-6">Employee</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Base Salary</th>
                    <th className="p-4">HRA & Allowances</th>
                    <th className="p-4">Deductions</th>
                    <th className="p-4">Net Payout</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.map((user) => {
                    const isEditing = editingUserId === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profile.avatarUrl}
                              alt={user.profile.firstName}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {user.profile.firstName} {user.profile.lastName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {user.employeeId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-medium text-slate-600">{user.profile.department}</td>

                        {/* Editable Form vs Static Fields */}
                        {isEditing ? (
                          <>
                            <td className="p-4">
                              <input
                                type="number"
                                value={editBasic}
                                onChange={(e) => setEditBasic(Number(e.target.value))}
                                className="w-24 px-2 py-1 bg-white border border-brand-400 rounded-lg text-xs font-bold"
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1.5">
                                <input
                                  type="number"
                                  placeholder="HRA"
                                  value={editHra}
                                  onChange={(e) => setEditHra(Number(e.target.value))}
                                  className="w-16 px-2 py-1 bg-white border border-brand-400 rounded-lg text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="Allowances"
                                  value={editAllowances}
                                  onChange={(e) => setEditAllowances(Number(e.target.value))}
                                  className="w-16 px-2 py-1 bg-white border border-brand-400 rounded-lg text-xs"
                                />
                              </div>
                            </td>
                            <td className="p-4">
                              <input
                                type="number"
                                value={editDeductions}
                                onChange={(e) => setEditDeductions(Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-white border border-rose-400 rounded-lg text-xs font-bold text-rose-600"
                              />
                            </td>
                            <td className="p-4 font-extrabold text-emerald-600 font-mono">
                              ${(editBasic + editHra + editAllowances - editDeductions).toLocaleString()}
                            </td>
                            <td className="p-4 pr-6 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => handleSaveSalary(e, user.id)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-[11px]"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 font-mono font-semibold text-slate-700">
                              ₹{user.salary.basicSalary.toLocaleString('en-IN')}
                            </td>
                            <td className="p-4 font-mono text-slate-500">
                              ₹{(user.salary.hra + user.salary.allowances).toLocaleString('en-IN')}
                            </td>
                            <td className="p-4 font-mono text-rose-500">
                              -₹{user.salary.deductions.toLocaleString('en-IN')}
                            </td>
                            <td className="p-4 font-mono font-extrabold text-emerald-600">
                              ₹{user.salary.netSalary.toLocaleString('en-IN')}
                            </td>
                          </>
                        )}

                        {!isEditing && (
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-all"
                                title="Update salary structure"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setPreviewUser(user);
                                  setPreviewMonth('August 2026');
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-all"
                                title="Preview payslip modal"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  generatePayslipPDF(user, 'August 2026');
                                  addToast('Payslip Downloaded', `Downloaded for ${user.profile.firstName}`, 'success');
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-all"
                                title="1-Click Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* EMPLOYEE VIEW: Interactive Compensation Breakdown & Slips */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Breakdown Cards */}
          <div className="lg:col-span-2 space-y-5">
            <h3 className="font-extrabold text-slate-900 text-sm">Monthly Compensation Breakdown</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Basic Salary</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">₹{basic.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-500 mt-1">Core contractual monthly base pay</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rent Allowance (HRA)</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">₹{hra.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-500 mt-1">Tax-exempt housing rent support</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Special Allowances</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">₹{allowances.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-500 mt-1">Dearness, travel, and mobile reimbursement</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Statutory Deductions</span>
                  <span className="block text-xl font-extrabold text-rose-600 mt-1">-₹{deductions.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-500 mt-1">EPF (12%), Professional Tax & TDS</p>
                </div>
              </div>
            </div>

            {/* Visual Bar Graph breakdown */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Gross vs. Net Ratio</h4>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Gross Income: ₹{gross.toLocaleString('en-IN')}</span>
                  <span className="text-brand-600">Net Take-Home: {((net / gross) * 100).toFixed(0)}%</span>
                </div>
                <div className="overflow-hidden h-3 rounded-full bg-slate-200 flex">
                  <div
                    style={{ width: `${(net / gross) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-500 transition-all duration-500"
                  />
                  <div
                    style={{ width: `${(deductions / gross) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-400 transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-medium">
                  <span>Take Home (₹{net.toLocaleString('en-IN')})</span>
                  <span>EPF, PT & TDS (₹{deductions.toLocaleString('en-IN')})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Historical Payslip Downloads */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Download Payslips</h3>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5">
              {payslipCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{cycle.month}</h4>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{cycle.reference}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-approved text-[9px] py-0.5 px-2">Paid</span>
                    <button
                      onClick={() => {
                        setPreviewUser(currentUser);
                        setPreviewMonth(cycle.month);
                      }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
                      title="Preview Statement"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        generatePayslipPDF(currentUser, cycle.month);
                        addToast('Payslip Downloaded', `Statement for ${cycle.month} downloaded.`, 'success');
                      }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all"
                      title="1-Click Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
