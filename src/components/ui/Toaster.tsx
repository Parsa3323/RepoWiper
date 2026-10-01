import React, { useEffect } from 'react';
import { Toast, toastState } from './useToast';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { AnimatedList } from './AnimatedList';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = toastState();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-w-md w-full">
      <AnimatedList className="space-y-4">
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
    <AlertCircle className="h-5 w-5 text-red-500" />
  ) : (
    <CheckCircle className="h-5 w-5 text-emerald-500" />
  );

  return (
    <div className={`rounded-lg border bg-[#111111] shadow-lg ${toast.variant === 'destructive' ? 'border-red-800' : 'border-gray-700'}`}>
      <div className="flex items-start p-4">
        <div className="mr-3 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          {toast.title && <h3 className="text-sm font-medium text-white">{toast.title}</h3>}
          {toast.description && <div className="mt-1 text-sm text-gray-400">{toast.description}</div>}
        </div>
        <button type="button" className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-300 focus:outline-none" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
