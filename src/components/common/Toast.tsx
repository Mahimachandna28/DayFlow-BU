import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClasses = 'bg-slate-900 text-white border-slate-700';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          colorClasses = 'bg-emerald-900/95 text-emerald-100 border-emerald-700 shadow-emerald-900/20';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClasses = 'bg-rose-900/95 text-rose-100 border-rose-700 shadow-rose-900/20';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClasses = 'bg-amber-900/95 text-amber-100 border-amber-700 shadow-amber-900/20';
        } else if (toast.type === 'info') {
          Icon = Info;
          colorClasses = 'bg-sky-900/95 text-sky-100 border-sky-700 shadow-sky-900/20';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${colorClasses}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
