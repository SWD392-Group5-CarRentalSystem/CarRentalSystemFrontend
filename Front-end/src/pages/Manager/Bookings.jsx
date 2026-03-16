import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar, Search, CheckCircle, XCircle, Clock, Eye, Trash2, X } from "lucide-react";
import { bookingService } from "../../services/api";
import { useToast } from "../../context";
import { ConfirmModal } from "../../components/common";

export default function Bookings() {
  const { setBreadcrumb } = useOutletContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailBooking, setDetailBooking] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setBreadcrumb({ title: "Bookings" });
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings();
      setBookings(response?.data ?? []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (booking) => {
    setCancelTarget(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await bookingService.updateBookingStatus(cancelTarget._id, 'cancelled');
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi huỷ đơn');
    } finally {
      setCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bookingService.deleteBooking(deleteTarget._id);
      setDeleteTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi xóa đơn thuê');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending:                        "bg-amber-100 text-amber-700 border-amber-200",
      awaiting_deposit_confirmation:  "bg-orange-100 text-orange-700 border-orange-200",
      confirmed:                      "bg-sky-100 text-sky-700 border-sky-200",
      vehicle_delivered:              "bg-blue-100 text-blue-700 border-blue-200",
      in_progress:                    "bg-emerald-100 text-emerald-700 border-emerald-200",
      vehicle_returned:               "bg-indigo-100 text-indigo-700 border-indigo-200",
      completed:                      "bg-teal-100 text-teal-700 border-teal-200",
      cancelled:                      "bg-red-100 text-red-700 border-red-200",
      deposit_lost:                   "bg-red-100 text-red-800 border-red-300",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    if (["completed", "confirmed"].includes(status)) return <CheckCircle size={16} />;
    if (["cancelled", "deposit_lost"].includes(status)) return <XCircle size={16} />;
    return <Clock size={16} />;
  };

  const getStatusText = (status) => {
    const texts = {
      pending:                        "Chờ xác nhận",
      awaiting_deposit_confirmation:  "Chờ duyệt cọc",
      confirmed:                      "Đã xác nhận",
      vehicle_delivered:              "Đã giao xe",
      in_progress:                    "Đang thuê",
      vehicle_returned:               "Đã trả xe",
      completed:                      "Hoàn thành",
      cancelled:                      "Đã hủy",
      deposit_lost:                   "Mất cọc",
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredBookings = bookings.filter(booking => {
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
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý đơn thuê</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {bookings.length} đơn thuê</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-75 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng, xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
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
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-linear-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.customerId?.username || String(booking.customerId || "N/A").slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">{booking.rentalType === "with_driver" ? "Có tài xế" : "Tự lái"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">
                      {booking.vehicleId?.vehicleName || String(booking.vehicleId || "N/A").slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">{booking.pickupLocation || ""}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-800">{formatDate(booking.startDate)}</p>
                      <p className="text-gray-500">→ {formatDate(booking.endDate)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-blue-600">{formatCurrency(Number(booking.totalAmount) || 0)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusStyle(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailBooking(booking)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      {!['completed','cancelled','deposit_lost'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking)}
                          className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50" title="Huỷ đơn">
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(booking)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Xoá">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* Booking Detail Modal */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Chi tiết đơn thuê</h2>
              <button onClick={() => setDetailBooking(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ['Đơn thuê #', String(detailBooking._id).slice(-8).toUpperCase()],
                ['Khách hàng', detailBooking.customerId?.username || detailBooking.customerId],
                ['Xe', detailBooking.vehicleId?.vehicleName || detailBooking.vehicleId],
                ['Loại thuê', detailBooking.rentalType === 'with_driver' ? 'Có tài xế' : 'Tự lái'],
                ['Tài xế', detailBooking.driverId?.username || '—'],
                ['Bắt đầu', new Date(detailBooking.startDate).toLocaleDateString('vi-VN')],
                ['Kết thúc', new Date(detailBooking.endDate).toLocaleDateString('vi-VN')],
                ['Điểm đón', detailBooking.pickupLocation],
                ['Điểm trả', detailBooking.dropoffLocation],
                ['Tổng tiền', new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(Number(detailBooking.totalAmount)||0)],
                ['Tiền cọc', new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(Number(detailBooking.depositAmount)||0)],
                ['Trạng thái cọc', detailBooking.depositStatus],
                ['Trạng thái', getStatusText(detailBooking.status)],
                ['Hợp đồng', detailBooking.contractFileUrl ? (
                  <a href={detailBooking.contractFileUrl} target="_blank" rel="noreferrer"
                    className="text-blue-600 underline">Xem file</a>
                ) : '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">{val ?? '—'}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end p-6 pt-0">
              <button onClick={() => setDetailBooking(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirm */}
      <ConfirmModal
        open={!!cancelTarget}
        variant="warning"
        icon="⚠️"
        title="Huỷ đơn thuê"
        description={`Bạn muốn huỷ đơn thuê của ${cancelTarget?.customerId?.username || 'khách hàng'}? Hành động này không thể hoàn tác.`}
        confirmLabel="Huỷ đơn"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />

      {/* Delete Booking Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        variant="danger"
        icon="🗑️"
        title="Xoá đơn thuê"
        description={`Xoá đơn thuê #${deleteTarget ? String(deleteTarget._id).slice(-8).toUpperCase() : ''}? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
