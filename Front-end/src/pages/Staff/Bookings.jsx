import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar, Search, Eye, CheckCircle, XCircle, Clock, ChevronDown } from "lucide-react";
import { bookingService } from "../../services/api";

const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  awaiting_deposit_confirmation: ["confirmed", "cancelled"],
  confirmed: ["vehicle_delivered", "cancelled"],
  vehicle_delivered: ["in_progress"],
  in_progress: ["vehicle_returned"],
  vehicle_returned: ["completed", "deposit_lost"],
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
  vehicle_returned: "Đã trả xe",
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

  const handleConfirmDeposit = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      await bookingService.staffConfirmDeposit(bookingId);
      await fetchBookings();
    } catch (error) {
      console.error("Failed to confirm deposit:", error);
      alert("Xác nhận cọc thất bại: " + (error?.message || "Lỗi không xác định"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      setOpenDropdown(null);
      await bookingService.updateBookingStatus(bookingId, newStatus);
      await fetchBookings();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Cập nhật trạng thái thất bại: " + (error?.message || "Lỗi không xác định"));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      awaiting_deposit_confirmation: "bg-orange-100 text-orange-700 border-orange-200",
      confirmed: "bg-sky-100 text-sky-700 border-sky-200",
      vehicle_delivered: "bg-blue-100 text-blue-700 border-blue-200",
      in_progress: "bg-emerald-100 text-emerald-700 border-emerald-200",
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
    </div>
  );
}
