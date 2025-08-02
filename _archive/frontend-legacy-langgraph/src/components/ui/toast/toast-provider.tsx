'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastContainer } from './toast';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = {
      id,
      duration: 5000, // Default 5 seconds
      ...toastData,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(current => current.filter(toast => toast.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Convenience functions for common toast types
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    success: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'success', message, ...options }),
    
    error: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'error', message, duration: 0, ...options }), // Errors persist until manually dismissed
    
    warning: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'warning', message, ...options }),
    
    info: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'info', message, ...options }),
  };
}