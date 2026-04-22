"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AdminToastProps extends Toast {}

function AdminToast({
  id,
  message,
  type,
  duration = 4000,
  action,
}: AdminToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      setIsClosing(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      className={`admin-toast admin-toast-${type} ${isClosing ? "admin-toast-closing" : ""}`}
      role="alert"
    >
      <div className="admin-toast-content">
        <span className="admin-toast-icon">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "info" && "ℹ"}
          {type === "warning" && "!"}
        </span>
        <p>{message}</p>
      </div>
      {action && (
        <button
          className="admin-toast-action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface AdminToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function AdminToastContainer({
  toasts,
  onRemove,
}: AdminToastContainerProps) {
  return (
    <div className="admin-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onAnimationEnd={() => {
            if (toast.duration !== 0) {
              onRemove(toast.id);
            }
          }}
        >
          <AdminToast {...toast} />
        </div>
      ))}
    </div>
  );
}

export function useAdminToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    type: ToastType = "info",
    duration?: number,
    action?: Toast["action"]
  ) => {
    const id = Math.random().toString(36).substring(2);
    const toast: Toast = { id, message, type, duration, action };
    setToasts((prev) => [...prev, toast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => {
    return addToast(message, "success", duration);
  };

  const error = (message: string, duration?: number) => {
    return addToast(message, "error", duration);
  };

  const info = (message: string, duration?: number) => {
    return addToast(message, "info", duration);
  };

  const warning = (message: string, duration?: number) => {
    return addToast(message, "warning", duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}
