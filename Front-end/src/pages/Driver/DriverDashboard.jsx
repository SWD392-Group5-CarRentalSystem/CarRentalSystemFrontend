import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MdCalendarToday, MdCheckCircle, MdCancel, MdPending } from "react-icons/md";
import { bookingService } from "../../services/api";
import { useAuthContext } from "../../context";

export default function DriverDashboard() {
  const { setBreadcrumb } = useOutletContext();
  const { user } = useAuthContext();
  const [stats, setStats] = useState({ pending: 0, accepted: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBreadcrumb({ title: "Dashboard" });
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingsByDriver(user?._id);
      const bookings = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const pending = bookings.filter((b) => !b.driverStatus || b.driverStatus === "pending_driver").length;
      const accepted = bookings.filter((b) => b.driverStatus === "accepted").length;
      const rejected = bookings.filter((b) => b.driverStatus === "rejected").length;
      setStats({ pending, accepted, rejected, total: bookings.length });
    } catch (err) {
      console.error("Error fetching driver stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: "Tổng lịch được giao",
      value: stats.total,
      icon: MdCalendarToday,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Chờ phản hồi",
      value: stats.pending,
      icon: MdPending,
      color: "from-yellow-400 to-yellow-500",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      label: "Đã đồng ý",
      value: stats.accepted,
      icon: MdCheckCircle,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Đã từ chối",
      value: stats.rejected,
      icon: MdCancel,
      color: "from-red-500 to-rose-500",
      bg: "bg-red-50",
      text: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">
          Xin chào, <span className="text-green-600">{user?.username}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Đây là tổng quan lịch phân công của bạn.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${card.color} flex items-center justify-center shadow-md`}>
              <card.icon className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick link */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <p className="text-gray-600 mb-4">
          Bạn có <span className="font-bold text-yellow-600">{stats.pending}</span> lịch đang chờ phản hồi.
        </p>
        <a
          href="/driver/schedule"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md"
        >
          <MdCalendarToday />
          Xem lịch phân công
        </a>
      </div>
    </div>
  );
}
