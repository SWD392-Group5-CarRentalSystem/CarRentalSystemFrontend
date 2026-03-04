import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Car, Users, Wallet, Activity, RefreshCw } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import { dashboardService, vehicleService, bookingService } from "../../services/api";

export default function Dashboard() {
  const { setBreadcrumb } = useOutletContext();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    rentedVehicles: 0,
    totalDrivers: 0,
    todayRevenue: 0,
    revenueChange: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBreadcrumb({ title: "Dashboard" });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // axiosInstance interceptor trả về response.data trực tiếp
      const [vehiclesRes, bookingsRes] = await Promise.all([
        vehicleService.getAllVehicles(),
        bookingService.getAllBookings()
      ]);

      const vehicles = vehiclesRes?.data ?? [];
      const bookings = bookingsRes?.data ?? [];
      
      const totalVehicles = vehicles.length;
      const rentedVehicles = bookings.filter(b =>
        ["in_progress", "vehicle_delivered", "vehicle_returned", "confirmed"].includes(b.status)
      ).length;
      
      const uniqueDrivers = new Set(bookings.map(b => b.driverId).filter(Boolean));
      const totalDrivers = uniqueDrivers.size;

      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
        return bookingDate === today && b.status === 'completed';
      });
      const todayRevenue = todayBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const yesterdayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
        return bookingDate === yesterday && b.status === 'completed';
      });
      const yesterdayRevenue = yesterdayBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
      const revenueChange = yesterdayRevenue > 0 
        ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
        : 0;

      setStats({
        totalVehicles,
        rentedVehicles,
        totalDrivers,
        todayRevenue,
        revenueChange
      });

      // Get recent bookings (latest 5)
      const sortedBookings = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentBookings(sortedBookings);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending:                        'Chờ xác nhận',
      awaiting_deposit_confirmation:  'Chờ duyệt cọc',
      confirmed:                      'Đã xác nhận',
      vehicle_delivered:              'Đã giao xe',
      in_progress:                    'Đang thuê',
      vehicle_returned:               'Đã trả xe',
      completed:                      'Hoàn thành',
      cancelled:                      'Đã hủy',
      deposit_lost:                   'Mất cọc',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending:                        'text-amber-700',
      awaiting_deposit_confirmation:  'text-orange-700',
      confirmed:                      'text-sky-700',
      vehicle_delivered:              'text-blue-700',
      in_progress:                    'text-emerald-700',
      vehicle_returned:               'text-indigo-700',
      completed:                      'text-teal-700',
      cancelled:                      'text-red-700',
      deposit_lost:                   'text-red-800',
    };
    return colorMap[status] || 'text-gray-700';
  };

  const getStatusBg = (status) => {
    const bgMap = {
      pending:                        'bg-amber-100',
      awaiting_deposit_confirmation:  'bg-orange-100',
      confirmed:                      'bg-sky-100',
      vehicle_delivered:              'bg-blue-100',
      in_progress:                    'bg-emerald-100',
      vehicle_returned:               'bg-indigo-100',
      completed:                      'bg-teal-100',
      cancelled:                      'bg-red-100',
      deposit_lost:                   'bg-red-100',
    };
    return bgMap[status] || 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-base text-gray-600 mt-1">
            Tổng quan hoạt động hệ thống
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="font-medium">Làm mới</span>
        </button>
      </div>

      {/* STATS */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Tổng xe"
            value={stats.totalVehicles.toString()}
            icon={<Car size={20} />}
            gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
          />
          <StatCard
            title="Xe đang thuê"
            value={stats.rentedVehicles.toString()}
            icon={<Activity size={20} />}
            gradient="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600"
          />
          <StatCard
            title="Tài xế"
            value={stats.totalDrivers.toString()}
            icon={<Users size={20} />}
            gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600"
          />
          <StatCard
            title="Doanh thu hôm nay"
            value={formatCurrency(stats.todayRevenue)}
            icon={<Wallet size={20} />}
            hint={stats.revenueChange !== 0 ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% so với hôm qua` : ''}
            gradient="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600"
          />
        </div>
      </section>

      {/* RECENT */}
      <section className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 bg-linear-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Đơn thuê gần đây
          </h2>
          <span 
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-semibold transition-colors"
            onClick={() => window.location.href = '/manager/bookings'}
          >
            Xem tất cả →
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div 
                key={booking.id || booking._id} 
                className="px-6 py-4 flex justify-between hover:bg-linear-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer transition-all duration-200 group"
              >
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {booking.customerId?.username || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {booking.vehicleId?.vehicleName || 'N/A'}
                  </p>
                </div>
                <span className={`font-semibold px-3 py-1 rounded-lg text-sm ${getStatusColor(booking.status)} ${getStatusBg(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Activity size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Chưa có đơn thuê nào</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
