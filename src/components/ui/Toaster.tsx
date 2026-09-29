import React, { useEffect } from 'react';
import { Toast, toastState } from './useToast';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = toastState();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
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
    <div
      className={`transform transition-all duration-300 ease-in-out max-h-screen ${
        toast.visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div
        className={`rounded-lg border bg-[#242424] shadow-lg ${
          toast.variant === 'destructive'
            ? 'border-red-800'
            : 'border-gray-700'
        }`}
      >
        <div className="p-4 flex items-start">
          <div className="flex-shrink-0 mr-3">
            {icon}
          </div>
          <div className="flex-1">
            {toast.title && (
              <h3 className="text-sm font-medium text-white">
                {toast.title}
              </h3>
            )}
            {toast.description && (
              <div className="mt-1 text-sm text-gray-400">
                {toast.description}
              </div>
            )}
          </div>
          <button
            type="button"
            className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-300 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
