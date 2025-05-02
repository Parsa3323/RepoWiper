import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  visible: boolean;
}

type ToastState = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'visible'>) => void;
  removeToast: (id: string) => void;
};

export const toastState = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = uuidv4();
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          variant: 'default',
          duration: 5000,
          visible: true,
          ...toast,
        },
      ],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      ),
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 300);
  },
}));

type ToastParams = Omit<Toast, 'id' | 'visible'>;

export const toast = (params: ToastParams) => {
  return toastState.getState().addToast(params);
};