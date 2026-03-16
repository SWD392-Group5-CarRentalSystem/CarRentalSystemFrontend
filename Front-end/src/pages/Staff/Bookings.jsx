import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar, Search, CheckCircle, XCircle, Clock, ChevronDown, UserCheck, X, Star, Car, FileText, Eye } from "lucide-react";
import { bookingService, staffService, paymentService } from "../../services/api";
import { useToast } from "../../context";
import { ConfirmModal } from "../../components/common";

const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  awaiting_deposit_confirmation: ["confirmed", "cancelled"],
  confirmed: ["cancelled"],          // vehicle_delivered handled by dedicated "Xuất xe" button
  vehicle_delivered: [],              // in_progress handled by customer's "Nhận xe" button
  in_progress: [],                    // transporting handled by driver
  transporting: [],                   // vehicle_returned handled by driver after payment
  vehicle_returned: [],
  completed: [],
  cancelled: [],
  deposit_lost: [],
};

const STATUS_TEXT = {
  pending: "Chờ xác nhận",
  awaiting_deposit_confirmation: "Chờ duyệt cọc",
  confirmed: "Đã xác nhận",
  vehicle_delivered: "Đã giao xe",
  in_progress: "Đang thuê",
  transporting: "Đang chở khách 🚗",
  vehicle_returned: "Xe đã trả — Chờ thanh toán",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  deposit_lost: "Mất cọc",
};

export default function StaffBookings() {
  const { setBreadcrumb } = useOutletContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  // confirmPayModal: null | { bookingId: string }
  const [confirmPayModal, setConfirmPayModal] = useState(null);
  const [confirmingPay, setConfirmingPay] = useState(false);
  // createPayLink: null | { bookingId: string, remaining: number }
  const [creatingPayLink, setCreatingPayLink] = useState(null);

  // Driver assignment modal state
  const [driverModal, setDriverModal] = useState(null); // { bookingId, startDate, endDate }
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);

  const toast = useToast();

  // Xuất xe (contract upload) modal state
  const [xuatXeModal, setXuatXeModal] = useState(null); // booking object
  const [xuatXeFile, setXuatXeFile] = useState(null);
  const [xuatXePreviewUrl, setXuatXePreviewUrl] = useState(null);
  const [xuatXeUploading, setXuatXeUploading] = useState(false);
  const [xuatXeError, setXuatXeError] = useState("");

  useEffect(() => {
    setBreadcrumb({ title: "Quản lý đặt xe" });
    fetchBookings();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings();
      setBookings(response?.data ?? []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const openXuatXe = (booking) => {
    setXuatXeModal(booking);
    setXuatXeFile(null);
    setXuatXePreviewUrl(null);
    setXuatXeError("");
  };

  const handleXuatXeFileChange = (file) => {
    setXuatXeFile(file);
    setXuatXeError("");
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setXuatXePreviewUrl(url);
    } else {
      setXuatXePreviewUrl(null);
    }
  };

  const handleXuatXeSubmit = async () => {
    if (!xuatXeFile) { setXuatXeError("Vui lòng chọn file hợp đồng."); return; }
    if (!xuatXeModal) return;
    setXuatXeUploading(true);
    setXuatXeError("");
    const receiverRole = xuatXeModal.rentalType === "with_driver" ? "driver" : "customer";
    try {
      await bookingService.receiveVehicle(xuatXeModal._id, xuatXeFile, receiverRole);
      setXuatXeModal(null);
      setXuatXeFile(null);
      if (xuatXePreviewUrl) URL.revokeObjectURL(xuatXePreviewUrl);
      setXuatXePreviewUrl(null);
      await fetchBookings();
    } catch (err) {
      setXuatXeError(err?.response?.data?.message ?? err?.message ?? "Upload hợp đồng thất bại.");
    } finally {
      setXuatXeUploading(false);
    }
  };

  const handleConfirmDeposit = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      await bookingService.staffConfirmDeposit(bookingId);
      await fetchBookings();
    } catch (error) {
      console.error("Failed to confirm deposit:", error);
      toast.error("Xác nhận cọ thất bại: " + (error?.message || "Lỗi không xác định"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      setOpenDropdown(null);
      await bookingService.updateBookingStatus(bookingId, newStatus);
      // Nếu staff đánh dấu "xe đã trả" → tự động chuyển sang hoàn thành ngay
      if (newStatus === "vehicle_returned") {
        await bookingService.updateBookingStatus(bookingId, "completed");
      }
      await fetchBookings();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Cập nhật trạng thái thất bại: " + (error?.message || "Lỗi không xác định"));
    } finally {
      setUpdatingId(null);
    }
  };

  const openDriverModal = async (booking) => {
    setDriverModal({ bookingId: booking._id, startDate: booking.startDate, endDate: booking.endDate });
    setDrivers([]);
    setDriversLoading(true);

    const start = new Date(booking.startDate);
    const end   = new Date(booking.endDate);

    // Helper: tính isBusy cho từng driver dựa vào bookings đã load
    const computeBusy = (allDrivers) => {
      const busyIds = new Set(
        bookings
          .filter((b) =>
            b._id !== booking._id &&
            b.driverId &&
            !["cancelled", "completed", "deposit_lost"].includes(b.status) &&
            new Date(b.startDate) < end &&
            new Date(b.endDate) > start
          )
          .map((b) => String(b.driverId?._id ?? b.driverId))
      );
      return allDrivers.map((d) => ({ ...d, isBusy: busyIds.has(String(d._id)) }));
    };

    try {
      // --- Thử endpoint availability trước ---
      const res = await bookingService.getDriversAvailability(
        new Date(booking.startDate).toISOString(),
        new Date(booking.endDate).toISOString(),
      );
      console.log("[DriverModal] availability response:", res);

      // Interceptor trả về response.data nên res = { success, data: [...] }
      const list = Array.isArray(res?.data) ? res.data
                 : Array.isArray(res)       ? res
                 : [];

      console.log("[DriverModal] drivers from availability:", list.length, list);

      if (list.length > 0) {
        setDrivers(list);
        setDriversLoading(false);
        return;
      }

      // Nếu availability trả về rỗng → fallback getAllDrivers
      console.warn("[DriverModal] availability returned empty, falling back to getAllDrivers");
    } catch (err) {
      console.warn("[DriverModal] availability endpoint failed:", err);
    }

    // --- Fallback: getAllDrivers ---
    try {
      const drRes = await staffService.getAllDrivers();
      console.log("[DriverModal] getAllDrivers response:", drRes);

      const allDrivers = Array.isArray(drRes?.data) ? drRes.data
                       : Array.isArray(drRes)        ? drRes
                       : [];

      console.log("[DriverModal] allDrivers count:", allDrivers.length, allDrivers);
      setDrivers(computeBusy(allDrivers));
    } catch (err2) {
      console.error("[DriverModal] getAllDrivers failed:", err2);
      toast.error("Không tải được danh sách tài xế. Vui lòng kiểm tra console.");
    } finally {
      setDriversLoading(false);
    }
  };

  const closeDriverModal = () => {
    setDriverModal(null);
    setDrivers([]);
  };

  const handleAssignDriver = async (driverId) => {
    if (!driverModal) return;
    try {
      setAssigningDriver(true);
      await bookingService.assignDriver(driverModal.bookingId, driverId);
      await fetchBookings();
      closeDriverModal();
    } catch (error) {
      console.error("Failed to assign driver:", error);
      toast.error("Chỉ định tài xế thất bại: " + (error?.response?.data?.message || error?.message || "Lỗi không xác định"));
    } finally {
      setAssigningDriver(false);
    }
  };

  const handleConfirmPay = async () => {
    if (!confirmPayModal) return;
    try {
      setConfirmingPay(true);
      setUpdatingId(confirmPayModal.bookingId);
      await bookingService.updateBookingStatus(confirmPayModal.bookingId, "completed");
      await fetchBookings();
      setConfirmPayModal(null);
    } catch (err) {
      toast.error(err?.message || "Đã xảy ra lỗi khi xác nhận thanh toán");
    } finally {
      setConfirmingPay(false);
      setUpdatingId(null);
    }
  };

  const handleCreatePayLink = async () => {
    if (!creatingPayLink) return;
    try {
      const res = await paymentService.createRemainingPaymentUrl(
        creatingPayLink.bookingId,
        creatingPayLink.remaining,
        'staff'
      );
      const url = res?.paymentUrl ?? res?.data?.paymentUrl;
      if (url) {
        setCreatingPayLink(null);
        window.location.href = url;
      } else {
        toast.error("Không tạo được link thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      toast.error(err?.message || "Đã xảy ra lỗi khi tạo link thanh toán");
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      awaiting_deposit_confirmation: "bg-orange-100 text-orange-700 border-orange-200",
      confirmed: "bg-sky-100 text-sky-700 border-sky-200",
      vehicle_delivered: "bg-blue-100 text-blue-700 border-blue-200",
      in_progress: "bg-emerald-100 text-emerald-700 border-emerald-200",
      transporting: "bg-violet-100 text-violet-700 border-violet-200",
      vehicle_returned: "bg-indigo-100 text-indigo-700 border-indigo-200",
      completed: "bg-teal-100 text-teal-700 border-teal-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      deposit_lost: "bg-red-100 text-red-800 border-red-300",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    if (["completed", "confirmed"].includes(status)) return <CheckCircle size={14} />;
    if (["cancelled", "deposit_lost"].includes(status)) return <XCircle size={14} />;
    return <Clock size={14} />;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking.customerId?.username || String(booking.customerId || "");
    const vehicleName = booking.vehicleId?.vehicleName || String(booking.vehicleId || "");
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý đặt xe</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {bookings.length} đơn thuê</p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Làm mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng, xe, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="awaiting_deposit_confirmation">Chờ duyệt cọc</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="vehicle_delivered">Đã giao xe</option>
            <option value="in_progress">Đang thuê</option>
            <option value="vehicle_returned">Đã trả xe</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="deposit_lost">Mất cọc</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Xe</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Thời gian</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Địa điểm</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => {
                const transitions = STATUS_TRANSITIONS[booking.status] || [];
                const isUpdating = updatingId === booking._id;

                return (
                  <tr
                    key={booking._id}
                    className="hover:bg-indigo-50/40 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {booking.customerId?.username || String(booking.customerId || "N/A").slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.rentalType === "with_driver" ? "Có tài xế" : "Tự lái"}
                      </p>
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {booking.vehicleId?.vehicleName || String(booking.vehicleId || "N/A").slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">{booking.vehicleId?.vehicleType || ""}</p>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-800">{formatDate(booking.startDate)}</p>
                        <p className="text-gray-500">→ {formatDate(booking.endDate)}</p>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{booking.pickupLocation || "—"}</p>
                      {booking.dropoffLocation && booking.dropoffLocation !== booking.pickupLocation && (
                        <p className="text-xs text-gray-400">→ {booking.dropoffLocation}</p>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-indigo-600">
                        {formatCurrency(Number(booking.totalAmount) || 0)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(booking.status)}`}
                      >
                        {getStatusIcon(booking.status)}
                        {STATUS_TEXT[booking.status] || booking.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                            {/* Xuất xe button — only for confirmed bookings */}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => openXuatXe(booking)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Car size={14} />
                            Xuất xe
                          </button>
                        )}

                        {/* Xem hợp đồng — if contract exists */}
                        {booking.contractFileUrl && (
                          <a
                            href={booking.contractFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors text-xs font-semibold"
                          >
                            <FileText size={14} />
                            Xem HĐ
                          </a>
                        )}

                        {/* Xác nhận / tạo thanh toán — self_drive vehicle_returned */}
                        {booking.rentalType === "self_drive" && booking.status === "vehicle_returned" && (
                          <>
                            {/* Tạo link VNPay cho khách */}
                            <button
                              onClick={() => setCreatingPayLink({
                                bookingId: booking._id,
                                remaining: (Number(booking.totalAmount) || 0) - (Number(booking.depositAmount) || 0),
                              })}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle size={14} />
                              Tạo thanh toán
                            </button>
                            {/* Xác nhận đã nhận tiền mặt */}
                            <button
                              onClick={() => setConfirmPayModal({ bookingId: booking._id })}
                              disabled={isUpdating || confirmingPay}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle size={14} />
                              Đã nhận TT
                            </button>
                          </>
                        )}

                        {/* Assign driver — with_driver bookings not finished */}
                        {booking.rentalType === "with_driver" &&
                          !["cancelled", "completed", "deposit_lost"].includes(booking.status) && (
                            <div className="flex flex-col gap-1">
                              {/* driverStatus badge */}
                              {booking.driverId && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border w-fit ${
                                    booking.driverStatus === "accepted"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : booking.driverStatus === "rejected"
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  }`}
                                >
                                  {booking.driverStatus === "accepted"
                                    ? "✔ Tài xế đã nhận"
                                    : booking.driverStatus === "rejected"
                                    ? "✖ Tài xế từ chối"
                                    : "⏳ Chờ tài xế xác nhận"}
                                </span>
                              )}
                              <button
                                onClick={() => openDriverModal(booking)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                  booking.driverStatus === "rejected"
                                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                    : "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100"
                                }`}
                              >
                                <UserCheck size={14} />
                                {!booking.driverId
                                  ? "Chỉ định tài xế"
                                  : booking.driverStatus === "rejected"
                                  ? "Phân công lại"
                                  : `Tài xế: ${booking.driverId?.username ?? "Đổi tài xế"}`}
                              </button>
                            </div>
                          )}
                        {/* Confirm deposit button for awaiting_deposit_confirmation */}
                        {booking.status === "awaiting_deposit_confirmation" && (
                          <button
                            onClick={() => handleConfirmDeposit(booking._id)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle size={14} />
                            {isUpdating ? "Đang xử lý..." : "Xác nhận cọc"}
                          </button>
                        )}

                        {/* Status update dropdown */}
                        {transitions.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(openDropdown === booking._id ? null : booking._id);
                              }}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-semibold border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-between"
                            >
                              <span>Cập nhật</span>
                              <ChevronDown size={14} />
                            </button>
                            {openDropdown === booking._id && (
                              <div
                                className="absolute right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-20 min-w-40"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {transitions.map((nextStatus) => (
                                  <button
                                    key={nextStatus}
                                    onClick={() => handleUpdateStatus(booking._id, nextStatus)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 text-gray-700 first:rounded-t-xl last:rounded-b-xl transition-colors"
                                  >
                                    → {STATUS_TEXT[nextStatus]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* No actions available */}
                        {booking.status === "awaiting_deposit_confirmation"
                          ? null
                          : transitions.length === 0 && (
                              <span className="text-xs text-gray-400 italic">Không có hành động</span>
                            )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy đơn thuê nào</p>
          </div>
        )}
      </div>

      {/* Xuất xe — Contract Upload Modal */}
      {xuatXeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Car size={20} className="text-emerald-600" />
                <div>
                  <h2 className="text-base font-bold text-gray-800">Xuất xe &amp; Ký hợp đồng</h2>
                  <p className="text-xs text-gray-400">
                    {xuatXeModal.vehicleId?.vehicleName ?? ""}
                    {" — "}
                    {xuatXeModal.rentalType === "with_driver" ? "Giao cho tài xế" : "Giao cho khách hàng"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setXuatXeModal(null); if (xuatXePreviewUrl) URL.revokeObjectURL(xuatXePreviewUrl); }}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Chụp ảnh hoặc scan hợp đồng giấy đã ký rồi tải lên.
                Sau khi upload thành công, hệ thống sẽ tự động chuyển trạng thái sang
                <strong> Đang thuê</strong>.
              </p>

              {/* File picker */}
              <div className="border-2 border-dashed border-emerald-300 rounded-xl p-5 text-center bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer">
                <label className="cursor-pointer block">
                  <FileText className="mx-auto text-emerald-400 mb-2" size={36} />
                  <span className="text-sm font-semibold text-emerald-600">
                    {xuatXeFile ? xuatXeFile.name : "Nhấn để chọn file (ảnh hoặc PDF)"}
                  </span>
                  {xuatXeFile && (
                    <p className="text-xs text-gray-400 mt-0.5">{(xuatXeFile.size / 1024).toFixed(1)} KB</p>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleXuatXeFileChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {/* Image preview */}
              {xuatXePreviewUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
                    <Eye size={14} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Xem trước file ảnh</span>
                  </div>
                  <img
                    src={xuatXePreviewUrl}
                    alt="preview"
                    className="w-full max-h-64 object-contain p-2"
                  />
                </div>
              )}

              {/* PDF note */}
              {xuatXeFile && xuatXeFile.type === "application/pdf" && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText size={16} className="text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700">File PDF: <strong>{xuatXeFile.name}</strong></p>
                </div>
              )}

              {xuatXeError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{xuatXeError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-5">
              <button
                type="button"
                onClick={() => { setXuatXeModal(null); if (xuatXePreviewUrl) URL.revokeObjectURL(xuatXePreviewUrl); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleXuatXeSubmit}
                disabled={xuatXeUploading || !xuatXeFile}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {xuatXeUploading ? "Đang upload..." : "✔ Xuất xe và lưu hợp đồng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {driverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-violet-600" />
                <h2 className="text-lg font-bold text-gray-800">Chỉ định tài xế</h2>
              </div>
              <button
                onClick={closeDriverModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {driversLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                  <p className="mt-3 text-gray-500 text-sm">Đang tải danh sách tài xế...</p>
                </div>
              ) : drivers.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">Không có tài xế nào</p>
              ) : (
                <ul className="space-y-2">
                  {drivers.map((driver) => (
                    <li key={driver._id}>
                      <button
                        disabled={driver.isBusy || assigningDriver}
                        onClick={() => handleAssignDriver(driver._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                          ${driver.isBusy
                            ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                            : "bg-white border-gray-200 hover:border-violet-400 hover:bg-violet-50 cursor-pointer"
                          }`}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {driver.avatar ? (
                            <img src={driver.avatar} alt={driver.username} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-violet-600 font-bold text-sm">
                              {driver.username?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{driver.username}</p>
                          <p className="text-xs text-gray-500">{driver.phoneNumber}</p>
                          {driver.Rating > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              {Number(driver.Rating).toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Status badge */}
                        {driver.isBusy ? (
                          <span className="shrink-0 px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-semibold">
                            Đã có lịch
                          </span>
                        ) : (
                          <span className="shrink-0 px-2 py-1 rounded-lg bg-green-100 text-green-600 text-xs font-semibold">
                            Rảnh
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100">
              <button
                onClick={closeDriverModal}
                className="w-full py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm tạo link thanh toán VNPay */}
      <ConfirmModal
        open={!!creatingPayLink}
        variant="info"
        icon="💳"
        title="Tạo thanh toán VNPay"
        description={
          creatingPayLink ? (
            <>
              Tạo link VNPay cho phần còn lại:{" "}
              <span className="font-semibold text-sky-600">
                {new Intl.NumberFormat("vi-VN").format(creatingPayLink.remaining)} ₫
              </span>
              . Bạn sẽ được chuyển đến trang thanh toán.
            </>
          ) : ""
        }
        confirmLabel="Tạo thanh toán"
        onConfirm={handleCreatePayLink}
        onCancel={() => setCreatingPayLink(null)}
        loading={false}
      />

      {/* Confirm thanh toán còn lại Modal */}
      <ConfirmModal
        open={!!confirmPayModal}
        variant="success"
        icon="💰"
        title="Xác nhận thanh toán"
        description={
          <>
            Khách đã thanh toán phần còn lại? Đơn sẽ chuyển sang trạng thái{" "}
            <span className="font-semibold text-emerald-600">Hoàn thành</span>.
          </>
        }
        confirmLabel="Xác nhận"
        onConfirm={handleConfirmPay}
        onCancel={() => setConfirmPayModal(null)}
        loading={confirmingPay}
      />
    </div>
  );
}
