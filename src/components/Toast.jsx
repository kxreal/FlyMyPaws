import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Usage:
 *   const [toast, setToast] = useState(null);
 *   setToast({ message: 'Saved!', type: 'success' }); // type: 'success' | 'error'
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 */
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type !== 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
        background: isSuccess ? '#1A2E1A' : '#2D1515',
        color: isSuccess ? '#86EFAC' : '#FCA5A5',
        border: `1px solid ${isSuccess ? '#166534' : '#7F1D1D'}`,
        borderRadius: '10px',
        padding: '0.85rem 1.1rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        maxWidth: '320px',
        fontSize: '0.875rem',
        fontWeight: 500,
        animation: 'slideInToast 0.25s ease-out',
      }}
    >
      {isSuccess
        ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '1px', color: '#4ADE80' }} />
        : <XCircle    size={16} style={{ flexShrink: 0, marginTop: '1px', color: '#F87171' }} />
      }
      <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0', display: 'flex', flexShrink: 0 }}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
