import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MdDirectionsCar, MdPeople, MdHistory, MdTrendingUp } from "react-icons/md";
import { bookingService } from "../../services/api";

const Dashboard = () => {
  const { setBreadcrumb } = useOutletContext();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalCustomers: 0,
    availableCars: 0,
  });

  useEffect(() => {
    setBreadcrumb({ title: "Dashboard" });
    // Fetch stats function would go here
    fetchStats();
  }, [setBreadcrumb]);

  const fetchStats = async () => {
    try {
      const response = await bookingService.getAllBookings();
      const bookings = response?.data ?? [];

      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(b =>
        ["confirmed", "vehicle_delivered", "in_progress", "vehicle_returned"].includes(b.status)
      ).length;
      const uniqueCustomers = new Set(bookings.map(b =>
        b.customerId?._id ?? b.customerId
      ).filter(Boolean));

      setStats({
        totalBookings,
        activeBookings,
        totalCustomers: uniqueCustomers.size,
        availableCars: 0, // cần gọi vehicleService nếu cần
      });
    } catch (err) {
      console.error("Staff dashboard fetch error:", err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-xl text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng đặt xe"
          value={stats.totalBookings}
          icon={MdHistory}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Đang hoạt động"
          value={stats.activeBookings}
          icon={MdTrendingUp}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Khách hàng"
          value={stats.totalCustomers}
          icon={MdPeople}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Xe sẵn sàng"
          value={stats.availableCars}
          icon={MdDirectionsCar}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <MdHistory className="text-4xl mx-auto mb-2 opacity-50" />
            <p>Chưa có hoạt động nào</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;