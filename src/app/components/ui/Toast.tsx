import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  onClose: (id: string) => void;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-gradient-secondary border border-green-200',
    icon: <CheckCircle2 className="w-5 h-5 text-white" />,
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-red-600 border border-red-300',
    icon: <AlertCircle className="w-5 h-5 text-white" />,
  },
  warning: {
    bg: 'bg-gradient-accent border border-yellow-300',
    icon: <AlertTriangle className="w-5 h-5 text-white" />,
  },
  info: {
    bg: 'bg-gradient-primary border border-blue-300',
    icon: <Info className="w-5 h-5 text-white" />,
  },
};

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function Toast({
  id,
  message,
  variant = 'info',
  duration = 5000,
  position = 'top-right',
  onClose,
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Auto dismiss
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        const decrement = (100 / duration) * 50; // Update every 50ms
        return Math.max(0, prev - decrement);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [id, duration, onClose]);

  const style = variantStyles[variant];

  return (
    <div
      className={`
        fixed z-50 ${positionStyles[position]}
        min-w-[320px] max-w-md
        ${style.bg}
        text-white rounded-2xl shadow-strong
        animate-slide-in-right
      `}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/20 rounded-b-2xl overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-50 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Toast Manager
interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

class ToastManager {
  private listeners: Array<(toasts: ToastItem[]) => void> = [];
  private toasts: ToastItem[] = [];

  subscribe(listener: (toasts: ToastItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(message: string, variant: ToastVariant = 'info', duration = 5000, position: ToastPosition = 'top-right') {
    const id = Math.random().toString(36).substring(7);
    this.toasts.push({ id, message, variant, duration, position });
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();

// Toast methods for easy use
export const toast = {
  success: (message: string, duration?: number, position?: ToastPosition) =>
    toastManager.show(message, 'success', duration, position),
  error: (message: string, duration?: number, position?: ToastPosition) =>
    toastManager.show(message, 'error', duration, position),
  warning: (message: string, duration?: number, position?: ToastPosition) =>
    toastManager.show(message, 'warning', duration, position),
  info: (message: string, duration?: number, position?: ToastPosition) =>
    toastManager.show(message, 'info', duration, position),
};

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  const handleClose = (id: string) => {
    toastManager.remove(id);
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={handleClose} />
      ))}
    </>
  );
}
