import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, message: '', type: 'info' });

  const [confirm, setConfirm] = useState<{
    show: boolean;
    message: string;
    title: string;
    onConfirm: () => void;
  }>({ show: false, message: '', title: '', onConfirm: () => {} });

  function showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    setAlert({ show: true, message, type });
  }

  function showConfirm(message: string, onConfirm: () => void, title: string = '확인') {
    setConfirm({ show: true, message, title, onConfirm });
  }

  function handleConfirm() {
    confirm.onConfirm();
    setConfirm({ show: false, message: '', title: '', onConfirm: () => {} });
  }

  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-secondary" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-accent" />;
      default:
        return <Info className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Alert Modal */}
      {alert.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-large max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {getIcon()}
              </div>
              <p className="text-base text-text-primary flex-1">{alert.message}</p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setAlert({ show: false, message: '', type: 'info' })}
                className="px-6 py-2.5 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-large max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">{confirm.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{confirm.message}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirm({ show: false, message: '', title: '', onConfirm: () => {} })}
                className="flex-1 px-4 py-2.5 bg-muted text-text-primary rounded-xl hover:bg-muted/80 transition-colors font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}
