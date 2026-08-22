import React, { useState } from 'react';
import {
  Download,
  Printer,
  Mail,
  X,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Building,
  IndianRupee,
  QrCode,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../../types';
import { generatePayslipPDF } from '../../lib/pdfGenerator';
import { useApp } from '../../context/AppContext';

interface PayslipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  initialMonth?: string;
}

export const PayslipPreviewModal: React.FC<PayslipPreviewModalProps> = ({
  isOpen,
  onClose,
  user,
  initialMonth = 'August 2026',
}) => {
  const { addToast } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  if (!isOpen) return null;

  const months = [
    'August 2026',
    'July 2026',
    'June 2026',
    'May 2026',
    'April 2026',
    'March 2026',
  ];

  const basic = user.salary.basicSalary;
  const hra = user.salary.hra;
  const allowances = user.salary.allowances;
  const deductions = user.salary.deductions;
  const grossEarnings = basic + hra + allowances;
  const netPay = grossEarnings - deductions;

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      generatePayslipPDF(user, selectedMonth);
      setIsDownloading(false);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
      addToast(
        'Payslip Downloaded',
        `Official statement for ${selectedMonth} saved as PDF.`,
        'success'
      );
    }, 400);
  };

  const handleEmail = () => {
    setIsEmailing(true);
    setTimeout(() => {
      setIsEmailing(false);
      addToast(
        'Payslip Dispatched',
        `Encrypted copy sent to ${user.email}`,
        'info'
      );
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.profile.avatarUrl}
              alt={user.profile.firstName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  {user.profile.firstName} {user.profile.lastName}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  {user.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.profile.designation} • {user.profile.department}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-600">Pay Cycle:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedMonth === m
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Document Preview Sheet */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Document Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-odoo-purple to-slate-900 text-white flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Official Statement
              </span>
              <h2 className="text-lg font-black tracking-tight mt-0.5">Dayflow HRMS Payslip</h2>
              <p className="text-xs text-slate-300">Period: {selectedMonth} • Ref: DFS-{selectedMonth.substring(0, 3).toUpperCase()}-{user.employeeId}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold block">✓ DISBURSED (NEFT/RTGS)</span>
              <span className="text-xl font-extrabold text-white font-mono">
                ₹{netPay.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 block font-semibold">Bank Name & Branch</span>
              <span className="font-bold text-slate-800">{user.salary.bankName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Account Number</span>
              <span className="font-bold text-slate-800 font-mono">{user.salary.bankAccount}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Tax ID / PAN</span>
              <span className="font-bold text-slate-800 font-mono">{user.salary.panOrTaxId}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Date of Joining</span>
              <span className="font-bold text-slate-800">{user.profile.dateOfJoining}</span>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Statutory Breakdown (INR)
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Earnings & Allowances</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-4">Statutory Deductions</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-4">Basic Salary</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">₹{basic.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">EPF (Provident Fund 12%)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">-₹{Math.round(basic * 0.12).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4">House Rent Allowance (HRA)</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">₹{hra.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">Income Tax (TDS u/s 192)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">-₹{Math.max(0, deductions - Math.round(basic * 0.12) - 200).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4">Special & Travel Allowances</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">₹{allowances.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">Professional Tax (PT)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">-₹200</td>
                  </tr>
                  <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                    <td className="py-2.5 px-4">Total Gross Earnings</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-600">₹{grossEarnings.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">Total Deductions</td>
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">-₹{deductions.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Authentic Watermark Badge */}
          <div className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-center justify-between text-xs text-brand-900">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-brand-600" />
              <div>
                <span className="font-bold block">Cryptographically Validated</span>
                <span className="text-[10px] text-brand-700">Digital Seal SHA256 Verified • No Physical Sign Required</span>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmail}
              disabled={isEmailing}
              className="btn-secondary text-xs py-2 px-3"
            >
              <Mail className="w-3.5 h-3.5" />
              {isEmailing ? 'Sending...' : 'Email Statement'}
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs py-2 px-3 hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary text-xs py-2 px-5 shadow-brand-500/20 bg-brand-600 hover:bg-brand-700"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Generating PDF...' : 'Download Official PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
