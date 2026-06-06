import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Premium custom Toast notifications
 * @param {string} message - Toast message to show
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {function} onClose - callback to run when closing toast
 * @param {number} duration - ms to show toast (default: 4000)
 */
export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const iconMap = {
    success: '✓',
    error: '✗',
    info: 'ℹ'
  };

  return (
    <div className={`toast-container toast-${type}`} role="alert" aria-live="assertive">
      <div className="toast-icon">{iconMap[type] || '✓'}</div>
      <div className="toast-content">{message}</div>
      <button 
        className="toast-close-btn" 
        onClick={onClose} 
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
