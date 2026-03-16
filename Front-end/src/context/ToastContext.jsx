import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const CONFIGS = {
  success: {
    Icon: MdCheckCircle,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    border: 'border-l-emerald-400',
    progress: 'bg-emerald-400',
    defaultTitle: 'Thành công',
    duration: 4000,
  },
  error: {
    Icon: MdError,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    border: 'border-l-red-400',
    progress: 'bg-red-400',
    defaultTitle: 'Lỗi',
    duration: 6000,
  },
  warning: {
    Icon: MdWarning,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    border: 'border-l-amber-400',
    progress: 'bg-amber-400',
    defaultTitle: 'Cảnh báo',
    duration: 5000,
  },
  info: {
    Icon: MdInfo,
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-100',
    border: 'border-l-sky-400',
    progress: 'bg-sky-400',
    defaultTitle: 'Thông tin',
    duration: 4000,
  },
};

let _toastId = 0;

// ─── Single Toast Item ─────────────────────────────────────────────────────────
const ToastItem = ({ toast, onRemove }) => {
  const cfg = CONFIGS[toast.type] ?? CONFIGS.info;
  const { Icon } = cfg;
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 380);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const t = setTimeout(dismiss, cfg.duration);
    return () => clearTimeout(t);
  }, [dismiss, cfg.duration]);

  return (
    <div
      className={`relative flex items-start gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 border-l-4 ${cfg.border} p-4 w-80 overflow-hidden`}
      style={{
        animation: leaving
          ? 'toastLeave 0.38s cubic-bezier(0.4, 0, 1, 1) forwards'
          : 'toastEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* Icon */}
      <div className={`w-9 h-9 ${cfg.iconBg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`text-xl ${cfg.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm font-bold text-gray-900 leading-tight">{toast.title ?? cfg.defaultTitle}</p>
        {toast.message && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{toast.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MdClose className="text-base" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.75 ${cfg.progress} opacity-60 rounded-b-2xl`}
        style={{ animation: `toastProgress ${cfg.duration}ms linear forwards` }}
      />
    </div>
  );
};

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

// ─── Toast Container ───────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-9999 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title) => {
    const id = ++_toastId;
    // Keep at most 5 toasts stacked
    setToasts((prev) => [...prev.slice(-4), { id, type, message: String(message ?? ''), title }]);
  }, []);

  const toast = {
    success: (message, title) => addToast('success', message, title),
    error:   (message, title) => addToast('error',   message, title),
    warning: (message, title) => addToast('warning', message, title),
    info:    (message, title) => addToast('info',    message, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
