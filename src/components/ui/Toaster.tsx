import React, { useEffect } from 'react';
import { Toast, toastState } from './useToast';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { AnimatedList } from './AnimatedList';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = toastState();

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:bottom-0 sm:left-auto sm:right-0 sm:top-auto sm:w-full sm:translate-x-0 sm:p-4">
      <AnimatedList className="space-y-2 sm:space-y-4">
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />)}
      </AnimatedList>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icon = toast.variant === 'destructive' ? (
    <AlertCircle className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
  ) : (
    <CheckCircle className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
  );

  return (
    <div className={`pointer-events-auto rounded-full border bg-[#111111] shadow-lg sm:rounded-2xl ${toast.variant === 'destructive' ? 'border-red-800' : 'border-gray-700'}`}>
      <div className="flex items-center px-4 py-2.5 sm:items-start sm:p-4">
        <div className="mr-2 flex-shrink-0 sm:mr-3">
          {icon}
        </div>
        <div className="flex-1">
          {toast.title && <h3 className="truncate text-xs font-medium text-white sm:text-sm">{toast.title}</h3>}
          {toast.description && <div className="mt-1 hidden text-sm text-gray-400 sm:block">{toast.description}</div>}
        </div>
        <button type="button" className="ml-3 flex-shrink-0 text-gray-500 hover:text-gray-300 focus:outline-none sm:ml-4" onClick={onClose}>
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
};
