import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MdCheckCircle, MdCancel, MdHome, MdReceipt, MdCalendarToday, MdArrowForward } from "react-icons/md";

const RESPONSE_CODES = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
  "12": "Thẻ/Tài khoản bị khóa.",
  "13": "Nhập sai mật khẩu xác thực OTP. Vui lòng thực hiện lại giao dịch.",
  "24": "Khách hàng hủy giao dịch.",
  "51": "Tài khoản không đủ số dư để thực hiện giao dịch.",
  "65": "Tài khoản vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Lỗi không xác định.",
};

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const getRedirectPath = (isRemaining, role) => {
  if (!isRemaining) return "/history";
  if (role === "customer") return "/history";
  if (role === "staff") return "/staff/bookings";
  return "/driver/schedule";
};

const getRedirectLabel = (isRemaining, role) => {
  if (!isRemaining) return "Lịch sử đặt xe";
  if (role === "customer") return "Lịch sử đặt xe";
  if (role === "staff") return "Quản lý đặt xe";
  return "Lịch phân công";
};

export default function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const success       = params.get("success") === "true";
  const responseCode  = params.get("responseCode") || "99";
  const bookingId     = params.get("bookingId") || "";
  const transactionNo = params.get("transactionNo") || "";
  const amount        = Number(params.get("amount") || "0");
  const isRemaining   = params.get("paymentType") === "remaining";
  const payerRole     = params.get("role") || "customer";

  const redirectPath  = getRedirectPath(isRemaining, payerRole);
  const redirectLabel = getRedirectLabel(isRemaining, payerRole);

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!success) return;
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [success]);

  useEffect(() => {
    if (success && countdown === 0) navigate(redirectPath);
  }, [countdown, success, navigate, redirectPath]);

  const Row = ({ icon: Icon, label, value, valueClass = "text-gray-800" }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="flex items-center gap-2 text-gray-400 text-sm">
        {Icon && <Icon className="text-base shrink-0" />}
        {label}
      </span>
      <span className={`font-semibold text-sm font-mono ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      {success ? (
        /* ══════════════ SUCCESS ══════════════ */
        <div className="w-full max-w-sm">
          {/* Icon + heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-5">
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                  <MdCheckCircle className="text-4xl text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thanh toán thành công!</h1>
            <p className="text-gray-400 text-sm mt-1.5">
              {isRemaining ? "Thanh toán phần còn lại đã hoàn tất" : "Đặt cọc của bạn đã được xác nhận"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Amount banner */}
            {amount > 0 && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-center">
                <p className="text-emerald-100 text-[11px] font-semibold uppercase tracking-widest mb-1">Số tiền thanh toán</p>
                <p className="text-white text-3xl font-black">{fmt(amount)}</p>
              </div>
            )}

            {/* Info rows */}
            <div className="px-6 pt-1 pb-0">
              {transactionNo && <Row icon={MdReceipt} label="Mã giao dịch VNPay" value={transactionNo} />}
              {bookingId && <Row icon={MdCalendarToday} label="Mã đặt xe" value={bookingId.slice(-8).toUpperCase()} />}
              <Row
                label="Trạng thái"
                value={isRemaining ? "✔ Hoàn thành" : "✔ Đã xác nhận"}
                valueClass="text-emerald-600 font-bold font-sans"
              />
            </div>

            {/* Countdown + buttons */}
            <div className="px-6 pb-6 pt-4 space-y-3">
              <div className="bg-gray-50 rounded-2xl py-3 text-center">
                <p className="text-gray-400 text-sm">
                  Tự động chuyển trang sau{" "}
                  <span className="font-black text-emerald-500 text-base">{countdown}s</span>
                </p>
              </div>

              <Link
                to={redirectPath}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-px active:translate-y-0"
              >
                {redirectLabel}
                <MdArrowForward />
              </Link>

              <Link
                to="/"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                <MdHome /> Về trang chủ
              </Link>
            </div>
          </div>
        </div>

      ) : (
        /* ══════════════ FAILURE ══════════════ */
        <div className="w-full max-w-sm">
          {/* Icon + heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-5">
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl shadow-red-500/40">
                  <MdCancel className="text-4xl text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thanh toán thất bại</h1>
            <p className="text-gray-400 text-sm mt-1.5 max-w-[260px] leading-relaxed">
              {RESPONSE_CODES[responseCode] || `Mã lỗi: ${responseCode}`}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              {bookingId && (
                <Row icon={MdCalendarToday} label="Mã đặt xe" value={bookingId.slice(-8).toUpperCase()} />
              )}
              <p className="text-red-400 text-xs leading-relaxed py-3">
                Đơn đặt xe vẫn được lưu lại. Bạn có thể thử thanh toán lại từ mục lịch sử đặt xe.
              </p>
            </div>

            <div className="px-6 pb-6 space-y-3">
              <Link
                to="/history"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-500/25 hover:shadow-xl hover:-translate-y-px active:translate-y-0"
              >
                Xem lịch sử đặt xe <MdArrowForward />
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                <MdHome /> Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}