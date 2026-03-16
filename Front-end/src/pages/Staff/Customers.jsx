import { useEffect, useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  MdPerson, MdEmail, MdPhone, MdSearch, MdInfo, MdShield,
  MdCalendarToday, MdCheckCircle, MdClose,
} from "react-icons/md";
import { bookingService } from "../../services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const BOOKING_STATUS_VI = {
  pending:           { label: "Chờ duyệt",     color: "bg-amber-100 text-amber-700" },
  confirmed:         { label: "Đã xác nhận",   color: "bg-blue-100 text-blue-700" },
  vehicle_delivered: { label: "Đã giao xe",    color: "bg-indigo-100 text-indigo-700" },
  in_progress:       { label: "Đang thuê",     color: "bg-cyan-100 text-cyan-700" },
  vehicle_returned:  { label: "Đã trả xe",     color: "bg-purple-100 text-purple-700" },
  completed:         { label: "Hoàn thành",    color: "bg-emerald-100 text-emerald-700" },
  cancelled:         { label: "Đã huỷ",        color: "bg-red-100 text-red-700" },
};
const statusOf = (s) => BOOKING_STATUS_VI[s] || { label: s, color: "bg-gray-100 text-gray-600" };

const fmtVND  = (n) => n ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

// ─── Customer Detail Modal ────────────────────────────────────────────────────
function CustomerDetailModal({ customer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-indigo-500 via-blue-600 to-cyan-600 p-6 text-white relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <MdClose className="text-lg" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/30">
              {customer.username?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="text-xl font-black">{customer.username}</h2>
              <p className="text-indigo-200 text-sm">Khách hàng · {customer.bookings.length} đơn đặt xe</p>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="p-5 space-y-3">
          {[
            { icon: MdEmail,  label: "Email",         value: customer.email },
            { icon: MdPhone,  label: "Điện thoại",    value: customer.phoneNumber },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Icon className="text-indigo-500 text-lg shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
              </div>
            </div>
          ))}

          {/* Booking summary */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: "Tổng đơn",    value: customer.bookings.length,                                              color: "indigo" },
              { label: "Hoàn thành",  value: customer.bookings.filter(b => b.status === "completed").length,        color: "emerald" },
              { label: "Chi tiêu",    value: fmtVND(customer.bookings.filter(b => b.status === "completed").reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0)), color: "blue" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-50 rounded-xl p-3 text-center border border-${color}-100`}>
                <p className={`text-sm font-black text-${color}-700`}>{value}</p>
                <p className={`text-[11px] text-${color}-500 mt-0.5`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Recent bookings */}
          {customer.bookings.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Đơn đặt xe gần đây</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customer.bookings.slice(0, 6).map((b) => {
                  const sv = statusOf(b.status);
                  return (
                    <div key={b._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {b.vehicleId?.vehicleName || "—"}
                        </p>
                        <p className="text-[11px] text-gray-400">{fmtDate(b.startDate)}</p>
                      </div>
                      <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${sv.color}`}>
                        {sv.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Read-only notice */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-600 font-medium">
            <MdShield className="text-base shrink-0" />
            Thông tin chỉ đọc. Liên hệ quản lý để chỉnh sửa.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StaffCustomers() {
  const { setBreadcrumb } = useOutletContext();
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected]     = useState(null);

  useEffect(() => { setBreadcrumb({ title: "Khách hàng" }); }, [setBreadcrumb]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAllBookings();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Derive unique customers from booking data
  const customers = useMemo(() => {
    const map = new Map();
    for (const b of bookings) {
      const c = b.customerId;
      if (!c || !c._id) continue;
      if (map.has(c._id)) {
        map.get(c._id).bookings.push(b);
      } else {
        map.set(c._id, {
          _id:         c._id,
          username:    c.username || "—",
          email:       c.email || "",
          phoneNumber: c.phoneNumber || "",
          bookings:    [b],
        });
      }
    }
    return [...map.values()].sort((a, b) => b.bookings.length - a.bookings.length);
  }, [bookings]);

  const filtered = useMemo(() =>
    customers.filter((c) =>
      c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm)
    ), [customers, searchTerm]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {customers.length} khách · <span className="font-medium text-indigo-600">Chế độ xem</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 rounded-xl text-xs text-indigo-700 font-semibold border border-indigo-100">
          <MdInfo className="text-base" />
          Chỉ xem — chỉnh sửa do Quản lý thực hiện
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng khách",    value: customers.length,                                                                               color: "indigo" },
          { label: "Có đặt xe",     value: customers.filter(c => c.bookings.length > 0).length,                                           color: "blue" },
          { label: "Đặt nhiều nhất",value: customers[0]?.bookings.length ?? 0,                                                            color: "violet" },
          { label: "Tổng đơn",      value: bookings.length,                                                                                color: "emerald" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black text-${color}-700`}>{value}</p>
            <p className={`text-xs font-semibold text-${color}-500 mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input type="text" placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Liên hệ</th>
                <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng đơn</th>
                <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Hoàn thành</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Chi tiêu</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => {
                const completed = c.bookings.filter((b) => b.status === "completed");
                const totalSpent = completed.reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
                return (
                  <tr key={c._id} className="hover:bg-indigo-50/30 transition-colors">
                    {/* Avatar + name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                          {c.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{c.username}</p>
                          <p className="text-[11px] text-gray-400 truncate">ID: {c._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MdEmail className="text-gray-300 shrink-0" /> {c.email}
                          </div>
                        )}
                        {c.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MdPhone className="text-gray-300 shrink-0" /> {c.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Total */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl">
                        {c.bookings.length}
                      </span>
                    </td>
                    {/* Completed */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <MdCheckCircle className="text-emerald-500" /> {completed.length}
                      </span>
                    </td>
                    {/* Spent */}
                    <td className="px-5 py-4 text-right font-semibold text-gray-800 text-xs">
                      {totalSpent > 0 ? fmtVND(totalSpent) : <span className="text-gray-300">—</span>}
                    </td>
                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors">
                        <MdPerson className="text-base" /> Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <MdPerson className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {searchTerm ? "Không tìm thấy khách hàng phù hợp" : "Chưa có dữ liệu khách hàng"}
            </p>
          </div>
        )}
      </div>

      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
