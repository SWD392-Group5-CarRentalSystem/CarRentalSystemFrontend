import PropTypes from 'prop-types';

// ─── Variant config ────────────────────────────────────────────────────────────
const VARIANTS = {
  danger: {
    iconBg: 'bg-red-50',
    iconBorder: 'border-red-100',
    glow: 'shadow-red-500/20',
    headerBg: 'from-red-50 to-rose-50',
    confirmBg: 'bg-red-500 hover:bg-red-600',
    confirmShadow: 'shadow-red-500/40',
    cancelHover: 'hover:border-red-200 hover:text-red-500',
  },
  warning: {
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-100',
    glow: 'shadow-amber-500/20',
    headerBg: 'from-amber-50 to-orange-50',
    confirmBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    confirmShadow: 'shadow-amber-500/40',
    cancelHover: 'hover:border-amber-200 hover:text-amber-600',
  },
  success: {
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-100',
    glow: 'shadow-emerald-500/20',
    headerBg: 'from-emerald-50 to-teal-50',
    confirmBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    confirmShadow: 'shadow-emerald-500/40',
    cancelHover: 'hover:border-emerald-200 hover:text-emerald-600',
  },
  info: {
    iconBg: 'bg-sky-50',
    iconBorder: 'border-sky-100',
    glow: 'shadow-sky-500/20',
    headerBg: 'from-sky-50 to-blue-50',
    confirmBg: 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600',
    confirmShadow: 'shadow-sky-500/40',
    cancelHover: 'hover:border-sky-200 hover:text-sky-600',
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────
const ConfirmModal = ({
  open,
  variant = 'info',
  icon,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  const v = VARIANTS[variant] ?? VARIANTS.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={() => !loading && onCancel()}
      />

      {/* Card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl ${v.glow} w-full max-w-xs overflow-hidden`}
        style={{ animation: 'modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        {/* Decorative header gradient */}
        <div className={`bg-gradient-to-br ${v.headerBg} pt-8 pb-6 px-6 flex flex-col items-center text-center`}>
          {/* Icon circle */}
          <div className={`w-20 h-20 ${v.iconBg} border-4 ${v.iconBorder} rounded-3xl flex items-center justify-center mb-5 shadow-inner`}>
            <span className="text-4xl leading-none select-none" role="img">{icon}</span>
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight">{title}</h3>

          {description && (
            <p className="text-sm text-gray-500 leading-relaxed mt-2 max-w-[220px]">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex gap-3 bg-white">
          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold text-sm ${v.cancelHover} transition-all duration-200 disabled:opacity-50`}
          >
            {cancelLabel}
          </button>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-2xl text-white font-bold text-sm transition-all duration-200 shadow-lg ${v.confirmShadow} hover:shadow-xl hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${v.confirmBg}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(['danger', 'warning', 'success', 'info']),
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ConfirmModal;
