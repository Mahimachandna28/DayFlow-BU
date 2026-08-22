import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Calculator,
  FileText,
  ShieldCheck,
  Zap,
  TrendingUp,
  RotateCcw,
  IndianRupee,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionType?: 'tax' | 'leave_draft' | 'epf_calc' | 'anomaly_audit' | 'general';
  actionData?: any;
}

export const AICopilotModal: React.FC = () => {
  const { currentUser, users, attendanceRecords, leaveRequests, setCurrentView, addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdminOrHR = currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER';

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Namaste ${currentUser.profile.firstName}! 🙏 I am **Dayflow AI Copilot**, your intelligent HR, Statutory & Tax Assistant. How can I assist you today?`,
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      generateAIResponse(textToSend);
      setIsTyping(false);
    }, 900);
  };

  const generateAIResponse = (query: string) => {
    const lower = query.toLowerCase();
    let replyText = '';
    let actionType: Message['actionType'] = 'general';
    let actionData: any = null;

    const basic = currentUser.salary.basicSalary;
    const hra = currentUser.salary.hra;
    const allowances = currentUser.salary.allowances;
    const annualGross = (basic + hra + allowances) * 12;

    if (lower.includes('tax') || lower.includes('regime') || lower.includes('80c') || lower.includes('old vs new')) {
      actionType = 'tax';
      // Compute Indian Income Tax comparison
      const stdDeductionNew = 75000;
      const stdDeductionOld = 50000;
      const sec80C = 150000;
      const sec80D = 25000;
      const hraExemption = Math.round(hra * 12 * 0.8);

      // Taxable New Regime
      const taxableNew = Math.max(0, annualGross - stdDeductionNew);
      let taxNew = 0;
      if (taxableNew > 1500000) taxNew = (taxableNew - 1500000) * 0.3 + 150000;
      else if (taxableNew > 1200000) taxNew = (taxableNew - 1200000) * 0.2 + 90000;
      else if (taxableNew > 900000) taxNew = (taxableNew - 900000) * 0.15 + 45000;
      else if (taxableNew > 600000) taxNew = (taxableNew - 600000) * 0.1 + 15000;
      else if (taxableNew > 300000) taxNew = (taxableNew - 300000) * 0.05;
      if (taxableNew <= 700000) taxNew = 0; // Section 87A rebate

      // Taxable Old Regime
      const totalOldDeductions = stdDeductionOld + sec80C + sec80D + hraExemption;
      const taxableOld = Math.max(0, annualGross - totalOldDeductions);
      let taxOld = 0;
      if (taxableOld > 1000000) taxOld = (taxableOld - 1000000) * 0.3 + 112500;
      else if (taxableOld > 500000) taxOld = (taxableOld - 500000) * 0.2 + 12500;
      else if (taxableOld > 250000) taxOld = (taxableOld - 250000) * 0.05;
      if (taxableOld <= 500000) taxOld = 0;

      const difference = Math.abs(Math.round(taxOld - taxNew));
      const recommended = taxNew <= taxOld ? 'New Tax Regime (Sec 115BAC)' : 'Old Tax Regime (with 80C/HRA)';

      replyText = `### 📊 Tax Regime Comparison (FY 2026-27)
**Annual Gross CTC:** ₹${annualGross.toLocaleString('en-IN')}

- **New Tax Regime:** Estimated Tax: **₹${Math.round(taxNew).toLocaleString('en-IN')}** (Standard Deduction: ₹75,000)
- **Old Tax Regime:** Estimated Tax: **₹${Math.round(taxOld).toLocaleString('en-IN')}** (with 80C ₹1.5L + 80D + HRA)

💡 **AI Recommendation:** Choose **${recommended}**. You save approximately **₹${difference.toLocaleString('en-IN')}** annually!`;

      actionData = { taxNew, taxOld, recommended, difference };
    } else if (lower.includes('leave') || lower.includes('draft') || lower.includes('sick') || lower.includes('vacation')) {
      actionType = 'leave_draft';
      replyText = `### ✍️ Generated Leave Justification
Here is an executive leave draft for your upcoming time-off:

> *"Dear HR Operations Team,*  
> *I would like to apply for formal time-off from Aug 28, 2026 to Aug 30, 2026 to celebrate Ganesh Chaturthi with family. All my deliverables and sprint tasks are delegated to the frontend peers. I will be reachable on email for urgent escalations.*  
> *Warm regards,  
> ${currentUser.profile.firstName} ${currentUser.profile.lastName} (${currentUser.employeeId})"*

Would you like to auto-apply this into your Leave Request portal?`;
    } else if (lower.includes('epf') || lower.includes('gratuity') || lower.includes('provident') || lower.includes('pension')) {
      actionType = 'epf_calc';
      const monthlyEpfEmployee = Math.round(basic * 0.12);
      const monthlyEpfEmployer = Math.round(basic * 0.12);
      const totalMonthlyEpf = monthlyEpfEmployee + monthlyEpfEmployer;
      const corpus5Yrs = Math.round(totalMonthlyEpf * 60 * 1.25);
      const corpus10Yrs = Math.round(totalMonthlyEpf * 120 * 1.65);

      replyText = `### 🏦 EPFO Retirement & Gratuity Projection
- **Monthly EPF Contribution (Employee 12%):** ₹${monthlyEpfEmployee.toLocaleString('en-IN')}
- **Employer Matching Contribution:** ₹${monthlyEpfEmployer.toLocaleString('en-IN')}
- **Total Monthly Savings:** ₹${totalMonthlyEpf.toLocaleString('en-IN')} (Interest: 8.25% p.a.)

📈 **Estimated Compounded Corpus:**
- **In 5 Years:** ₹${corpus5Yrs.toLocaleString('en-IN')}
- **In 10 Years:** ₹${corpus10Yrs.toLocaleString('en-IN')}`;
    } else if (lower.includes('anomaly') || lower.includes('audit') || lower.includes('fraud') || lower.includes('security')) {
      actionType = 'anomaly_audit';
      const breaches = attendanceRecords.filter((r) => r.geoDistanceKm && r.geoDistanceKm > 0.5);
      const blocked = attendanceRecords.filter((r) => r.locationStatus === 'blocked');

      replyText = `### 🛡️ AI Security & Geo-Fence Audit
Audited **${attendanceRecords.length} records** across 10 staff:

- **Geo-Perimeter Breaches:** ${breaches.length} detected (e.g. Vikram Malhotra at 14.2 km).
- **Disabled GPS Sensor Clock-Ins:** ${blocked.length} flagged.
- **Punctuality Score:** 96.4% on-time check-in rate before 10:00 AM.

All audit logs are cryptographically stamped with device IDs.`;
    } else {
      replyText = `I analyzed our Indian corporate guidelines for Dayflow Technologies India Pvt. Ltd. (Bengaluru HQ).
      
- **Annual Paid Leaves:** 18 Days (Accrued monthly)
- **Sick / Medical Leaves:** 12 Days (with physician proof for >2 days)
- **Standard Working Shift:** 9:00 AM - 6:00 PM (Monday to Saturday)
- **Statutory Compliances:** 100% EPF, Professional Tax (PT), and TDS Section 192 compliant.

You can ask me to draft leave letters, compare Tax Regimes, or audit attendance!`;
    }

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType,
      actionData,
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  const quickPrompts = [
    { label: '💰 New vs Old Tax Regime', query: 'Compare my New vs Old Tax regime liability' },
    { label: '✍️ Draft Leave Application', query: 'Draft a leave application for family vacation' },
    { label: '🏦 EPF & Gratuity Projection', query: 'Calculate my EPF and Gratuity projection' },
    ...(isAdminOrHR ? [{ label: '🛡️ Audit Attendance Anomalies', query: 'Audit attendance anomalies and geo breaches' }] : []),
  ];

  return (
    <>
      {/* Floating AI Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-3xl bg-gradient-to-r from-purple-600 via-brand-600 to-indigo-600 text-white shadow-2xl hover:scale-105 hover:shadow-purple-500/30 transition-all flex items-center gap-2.5 group"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-purple-600 animate-pulse"></span>
        </div>
        <span className="font-extrabold text-xs hidden sm:inline tracking-wide">DayFlow AI Copilot</span>
      </button>

      {/* Copilot Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[85vh] sm:h-[650px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-purple-700 via-brand-700 to-slate-900 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md text-purple-200 border border-white/10">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    DayFlow AI Copilot <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">v2.4</span>
                  </h3>
                  <p className="text-[11px] text-purple-200">Statutory Tax & HR Intelligence Engine</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 text-[11px] font-semibold whitespace-nowrap shadow-2xs hover:bg-purple-50 transition-all flex items-center gap-1"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="prose prose-xs leading-relaxed break-words">
                      {m.text.split('\n').map((line, lIdx) => (
                        <p key={lIdx} className="mb-1 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>

                    {/* Interactive Action Buttons inside AI Responses */}
                    {m.actionType === 'leave_draft' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            setCurrentView('leaves');
                            addToast('Navigated to Leaves', 'Form opened with AI draft assistance.', 'info');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-[11px] hover:bg-brand-700 flex items-center gap-1 shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Go to Leave Portal
                        </button>
                      </div>
                    )}

                    {m.actionType === 'tax' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            setCurrentView('payroll');
                            addToast('Payroll Center', 'Viewing detailed statutory breakdown.', 'info');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 flex items-center gap-1 shadow-xs"
                        >
                          <IndianRupee className="w-3.5 h-3.5" /> View Salary Slips
                        </button>
                      </div>
                    )}

                    <span
                      className={`text-[9px] mt-1 block ${
                        m.sender === 'user' ? 'text-brand-100 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                  <Bot className="w-4 h-4 text-purple-600 animate-spin-slow" />
                  <span>DayFlow AI is computing statutory analysis...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask AI anything (e.g. Tax breakdown, Leave drafting, EPF)..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-brand-600 text-white rounded-2xl hover:opacity-90 disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
