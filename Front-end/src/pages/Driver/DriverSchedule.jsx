import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  MdCalendarToday,
  MdLocationOn,
  MdDirectionsCar,
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdRefresh,
  MdAccessTime,
} from "react-icons/md";
import { bookingService } from "../../services/api";
import { useAuthContext } from "../../context";

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending_driver", label: "Chờ phản hồi" },
  { key: "accepted", label: "Đã đồng ý" },
  { key: "rejected", label: "Đã từ chối" },
];

const driverStatusConfig = {
  pending_driver: {
    label: "Chờ phản hồi",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: MdPending,
  },
  accepted: {
    label: "Đã đồng ý",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: MdCheckCircle,
  },
  rejected: {
    label: "Đã từ chối",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: MdCancel,
  },
};

const bookingStatusVi = {
  pending: "Chờ xử lý",
  awaiting_deposit_confirmation: "Chờ xác nhận cọc",
  confirmed: "Đã xác nhận",
  vehicle_delivered: "Đã giao xe",
  in_progress: "Đang thực hiện",
  vehicle_returned: "Đã trả xe",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
  deposit_lost: "Mất cọc",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export default function DriverSchedule() {
  const { setBreadcrumb } = useOutletContext();
  const { user } = useAuthContext();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(null); // bookingId being actioned
  const [rejectModal, setRejectModal] = useState(null); // { bookingId }
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    setBreadcrumb({ title: "Lịch phân công" });
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingsByDriver(user?._id);
      const raw = res?.data ?? res ?? [];
      setBookings(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAccept = async (bookingId) => {
    try {
      setActionLoading(bookingId + "_accept");
      await bookingService.driverAcceptBooking(bookingId, user?._id);
      showToast("success", "Đã đồng ý nhận lịch thành công!");
      await fetchBookings();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    try {
      setActionLoading(rejectModal.bookingId + "_reject");
      await bookingService.driverRejectBooking(rejectModal.bookingId, user?._id, rejectReason);
      showToast("success", "Đã từ chối lịch. Staff sẽ phân công lại.");
      setRejectModal(null);
      setRejectReason("");
      await fetchBookings();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending_driver") return !b.driverStatus || b.driverStatus === "pending_driver";
    return b.driverStatus === activeTab;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Đang tải lịch phân công...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm animate-fade-in ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lịch phân công</h1>
          <p className="text-gray-500 mt-1">Tổng cộng {bookings.length} lịch được giao</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md"
        >
          <MdRefresh size={18} />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-green-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-green-400"
            }`}
          >
            {tab.label}
            {tab.key === "pending_driver" && (
              <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {bookings.filter((b) => !b.driverStatus || b.driverStatus === "pending_driver").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <MdCalendarToday className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 font-medium">Không có lịch nào</p>
          </div>
        ) : (
          filtered.map((booking) => {
            const dsKey = booking.driverStatus || "pending_driver";
            const dsCfg = driverStatusConfig[dsKey];
            const DSIcon = dsCfg.icon;
            const isPending = dsKey === "pending_driver";

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">#{String(booking._id).slice(-8).toUpperCase()}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                      {bookingStatusVi[booking.status] ?? booking.status}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${dsCfg.color}`}>
                    <DSIcon className="text-sm" />
                    {dsCfg.label}
                  </span>
                </div>

                {/* Body */}
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Customer */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <MdPerson className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Khách hàng</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {booking.customerId?.username ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500">{booking.customerId?.phoneNumber ?? ""}</p>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <MdDirectionsCar className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Xe</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {booking.vehicleId?.vehicleName ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500">{booking.vehicleId?.vehicleType ?? ""}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                      <MdAccessTime className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Thời gian</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      <MdLocationOn className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Điểm đón / trả</p>
                      <p className="text-sm text-gray-800">{booking.pickupLocation ?? "—"}</p>
                      <p className="text-xs text-gray-500">{booking.dropoffLocation ?? ""}</p>
                    </div>
                  </div>
                </div>

                {/* Reject reason (if rejected) */}
                {dsKey === "rejected" && booking.driverRejectReason && (
                  <div className="px-6 pb-4">
                    <p className="text-xs text-red-500 italic">
                      Lý do từ chối: {booking.driverRejectReason}
                    </p>
                  </div>
                )}

                {/* Actions — only show if pending */}
                {isPending && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setRejectModal({ bookingId: booking._id });
                        setRejectReason("");
                      }}
                      disabled={!!actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <MdCancel size={18} />
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleAccept(booking._id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors shadow-md disabled:opacity-50"
                    >
                      {actionLoading === booking._id + "_accept" ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MdCheckCircle size={18} />
                      )}
                      Đồng ý
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận từ chối</h3>
            <p className="text-gray-500 text-sm mb-4">
              Bạn có chắc muốn từ chối lịch này? Staff sẽ cần phân công lại.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do từ chối <span className="text-gray-400">(tuỳ chọn)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-5 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors shadow-md disabled:opacity-50"
              >
                {actionLoading?.includes("_reject") ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MdCancel size={16} />
                )}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
