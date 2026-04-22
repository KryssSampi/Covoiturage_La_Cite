"use client";

import { useEffect } from "react";

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDangerous?: boolean;
  hasInput?: boolean;
  inputValue?: string;
  inputPlaceholder?: string;
  onInputChange?: (value: string) => void;
  inputRows?: number;
}

export default function AdminModal({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  onCancel,
  children,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isLoading = false,
  isDangerous = false,
  hasInput = false,
  inputValue = "",
  inputPlaceholder = "",
  onInputChange,
  inputRows = 1,
}: AdminModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{title}</h2>
          <button
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Fermer"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {message && <p className="admin-modal-message">{message}</p>}

        {children && <div className="admin-modal-body">{children}</div>}

        {hasInput && (
          <div className="admin-modal-input-container">
            {inputRows > 1 ? (
              <textarea
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                placeholder={inputPlaceholder}
                rows={inputRows}
                className="admin-modal-textarea"
                disabled={isLoading}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                placeholder={inputPlaceholder}
                className="admin-modal-input"
                disabled={isLoading}
                autoFocus
              />
            )}
          </div>
        )}

        <div className="admin-modal-footer">
          <button
            className="btn-link"
            onClick={onCancel || onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              className={isDangerous ? "btn-danger" : "btn-primary"}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Traitement..." : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
