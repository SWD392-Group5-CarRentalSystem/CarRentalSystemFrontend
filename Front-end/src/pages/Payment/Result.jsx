import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MdCheckCircle, MdCancel, MdHistory, MdHome, MdDirectionsCar } from "react-icons/md";

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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const success = params.get("success") === "true";
  const responseCode = params.get("responseCode") || "99";
  const bookingId = params.get("bookingId") || "";
  const transactionNo = params.get("transactionNo") || "";
  const amount = Number(params.get("amount") || "0");

  const [countdown, setCountdown] = useState(10);

  // Đếm ngược 10s nếu thành công
  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [success]);

  // Navigate khi countdown về 0
  useEffect(() => {
    if (success && countdown === 0) {
      navigate("/history");
    }
  }, [countdown, success, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-white to-indigo-50 pt-20 px-4">
      <div className="max-w-lg mx-auto">
        {success ? (
          /* ===== SUCCESS ===== */
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-emerald-500 to-teal-500 px-8 py-10 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdCheckCircle className="text-5xl text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Thanh toán thành công!</h1>
              <p className="text-emerald-100 text-sm">Đặt cọc của bạn đã được xác nhận</p>
            </div>

            {/* Details */}
            <div className="p-8 space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3">
                {amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Số tiền đã thanh toán</span>
                    <span className="font-black text-emerald-600 text-lg">{formatCurrency(amount)}</span>
                  </div>
                )}
                {transactionNo && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Mã giao dịch VNPay</span>
                    <span className="font-mono font-semibold text-gray-800 text-sm">{transactionNo}</span>
                  </div>
                )}
                {bookingId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Mã đặt xe</span>
                    <span className="font-mono font-semibold text-gray-800 text-sm">
                      {bookingId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Trạng thái đặt xe</span>
                  <span className="font-semibold text-emerald-600">Đã xác nhận ✓</span>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center">
                <p className="text-sky-700 text-sm">
                  Chuyển sang lịch sử đặt xe sau{" "}
                  <span className="font-black text-sky-600 text-base">{countdown}s</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/history"
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition font-semibold text-sm"
                >
                  <MdHistory /> Lịch sử đặt xe
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-semibold text-sm"
                >
                  <MdHome /> Trang chủ
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ===== FAILURE ===== */
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-red-500 to-rose-500 px-8 py-10 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdCancel className="text-5xl text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Thanh toán thất bại</h1>
              <p className="text-red-100 text-sm">
                {RESPONSE_CODES[responseCode] || `Mã lỗi: ${responseCode}`}
              </p>
            </div>

            {/* Details */}
            <div className="p-8 space-y-4">
              {bookingId && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Mã đặt xe</span>
                    <span className="font-mono font-semibold text-gray-800 text-sm">
                      {bookingId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-red-600 text-xs mt-3">
                    Đơn đặt xe vẫn được lưu. Bạn có thể thử thanh toán lại từ mục lịch sử đặt xe.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/history"
                  className="flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition font-semibold text-sm"
                >
                  <MdHistory /> Xem lịch sử đặt xe
                </Link>
                <Link
                  to="/vehicles"
                  className="flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition font-semibold text-sm"
                >
                  <MdDirectionsCar /> Đặt xe lại
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-semibold text-sm"
                >
                  <MdHome /> Trang chủ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
