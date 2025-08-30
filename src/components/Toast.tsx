"use client";

import { useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Undo,
} from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info" | "undo";
  duration?: number;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({
  message,
  type,
  duration = 4000,
  onClose,
  action,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    undo: Undo,
  };

  const colors = {
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error:
      "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    undo: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200",
  };

  const Icon = icons[type];

  return (
    <div className="fixed top-4 right-4 z-40">
      <div
        className={`
          flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[480px]
          transform transition-all duration-300 ease-out
          ${
            isExiting
              ? "translate-x-full opacity-0"
              : "translate-x-0 opacity-100"
          }
          ${colors[type]}
        `}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium underline hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
