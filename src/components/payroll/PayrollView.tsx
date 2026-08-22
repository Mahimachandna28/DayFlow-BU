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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generatePayslipPDF } from '../../lib/pdfGenerator';
import { User, SalaryStructure } from '../../types';

export const PayrollView: React.FC = () => {
  const { currentUser, users, updateSalary, addToast } = useApp();

  const isAdminOrHR = currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER';

  // Admin states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-brand-600" />
            Payroll & Salary Sheets
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {isAdminOrHR
              ? 'Manage corporate compensation scales, verify banking routes, and issue corporate PDF payslips'
              : 'Review salary structures, earnings statements, deductions breakdown, and download historical payslips'}
          </p>
        </div>
      </div>

      {/* ADMIN VIEW: Master Payroll Table */}
      {isAdminOrHR ? (
        <div className="space-y-4">
          {/* Filtering panel */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="p-4 pl-6">Employee</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Basic Salary</th>
                    <th className="p-4">HRA</th>
                    <th className="p-4">Allowances</th>
                    <th className="p-4">Deductions</th>
                    <th className="p-4 font-bold text-slate-800">Net Salary</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.map((user) => {
                    const isEditing = editingUserId === user.id;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2">
                            <img
                              src={user.profile.avatarUrl}
                              alt={user.profile.firstName}
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-100"
                            />
                            <div>
                              <p className="font-bold text-slate-800">
                                {user.profile.firstName} {user.profile.lastName}
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono">{user.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-600">{user.profile.department}</td>
                        {isEditing ? (
                          <td colSpan={5} className="p-4">
                            <form
                              onSubmit={(e) => handleSaveSalary(e, user.id)}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <div className="w-20">
                                <label className="block text-[8px] font-bold text-slate-400">Basic</label>
                                <input
                                  type="number"
                                  value={editBasic}
                                  onChange={(e) => setEditBasic(Number(e.target.value))}
                                  className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                                />
                              </div>
                              <div className="w-20">
                                <label className="block text-[8px] font-bold text-slate-400">HRA</label>
                                <input
                                  type="number"
                                  value={editHra}
                                  onChange={(e) => setEditHra(Number(e.target.value))}
                                  className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                                />
                              </div>
                              <div className="w-20">
                                <label className="block text-[8px] font-bold text-slate-400">Allowances</label>
                                <input
                                  type="number"
                                  value={editAllowances}
                                  onChange={(e) => setEditAllowances(Number(e.target.value))}
                                  className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                                />
                              </div>
                              <div className="w-20">
                                <label className="block text-[8px] font-bold text-slate-400">Deductions</label>
                                <input
                                  type="number"
                                  value={editDeductions}
                                  onChange={(e) => setEditDeductions(Number(e.target.value))}
                                  className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                                />
                              </div>
                              <div className="w-28">
                                <label className="block text-[8px] font-bold text-slate-400">Bank Acct</label>
                                <input
                                  type="text"
                                  value={editBank}
                                  onChange={(e) => setEditBank(e.target.value)}
                                  className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                                />
                              </div>
                              <div className="flex gap-1.5 self-end">
                                <button type="submit" className="btn-primary py-1 px-2.5 text-[10px] rounded-lg">
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUserId(null)}
                                  className="btn-secondary py-1 px-2.5 text-[10px] rounded-lg"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        ) : (
                          <>
                            <td className="p-4 text-slate-700">${user.salary.basicSalary.toLocaleString()}</td>
                            <td className="p-4 text-slate-700">${user.salary.hra.toLocaleString()}</td>
                            <td className="p-4 text-slate-700">${user.salary.allowances.toLocaleString()}</td>
                            <td className="p-4 text-rose-600">-${user.salary.deductions.toLocaleString()}</td>
                            <td className="p-4 font-bold text-emerald-600">
                              ${user.salary.netSalary.toLocaleString()}
                            </td>
                          </>
                        )}
                        {!isEditing && (
                          <td className="p-4 pr-6 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-all"
                              title="Update salary structure"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => generatePayslipPDF(user, 'August 2026')}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-all"
                              title="Generate PDF payslip"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
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
            <h3 className="font-extrabold text-slate-900 text-sm">compensation structure breakdown</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Basic Earnings</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">${basic.toLocaleString()} USD</span>
                  <p className="text-[10px] text-slate-500 mt-1">Core contractual monthly base pay</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rent Allowance (HRA)</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">${hra.toLocaleString()} USD</span>
                  <p className="text-[10px] text-slate-500 mt-1">Tax-exempt housing rent support</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Other Allowances</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">${allowances.toLocaleString()} USD</span>
                  <p className="text-[10px] text-slate-500 mt-1">Special travel, health, and phone credits</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tax & Deductions</span>
                  <span className="block text-xl font-extrabold text-rose-600 mt-1">-${deductions.toLocaleString()} USD</span>
                  <p className="text-[10px] text-slate-500 mt-1">Income tax (TDS) & social security deductions</p>
                </div>
              </div>
            </div>

            {/* Visual Bar Graph breakdown */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Gross vs. Net Ratio</h4>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Gross Income: ${gross.toLocaleString()}</span>
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
                  <span>Take Home (${net.toLocaleString()})</span>
                  <span>Taxes & PF (${deductions.toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Historical Payslip Downloads */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Download Payslips</h3>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3.5">
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
                      onClick={() => generatePayslipPDF(currentUser, cycle.month)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all"
                      title="Download PDF"
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
    </div>
  );
};
