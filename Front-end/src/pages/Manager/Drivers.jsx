import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Plus, Search, Phone, Mail, MapPin, Star, Eye } from "lucide-react";

export default function Drivers() {
  const { setBreadcrumb } = useOutletContext();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setBreadcrumb({ title: "Drivers" });
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      // Simulating API call with mock data
      setTimeout(() => {
        setDrivers([
          { id: 1, name: "Nguyễn Văn An", phone: "0901234567", email: "vanan@email.com", address: "Hà Nội", rating: 4.8, trips: 152, status: "active" },
          { id: 2, name: "Trần Minh Bình", phone: "0912345678", email: "minhbinh@email.com", address: "TP.HCM", rating: 4.9, trips: 203, status: "active" },
          { id: 3, name: "Lê Thị Cẩm", phone: "0923456789", email: "thicam@email.com", address: "Đà Nẵng", rating: 4.7, trips: 98, status: "active" },
          { id: 4, name: "Phạm Đức Dũng", phone: "0934567890", email: "ducdung@email.com", address: "Hải Phòng", rating: 4.6, trips: 87, status: "inactive" },
          { id: 5, name: "Hoàng Thị Em", phone: "0945678901", email: "thiem@email.com", address: "Cần Thơ", rating: 4.9, trips: 176, status: "active" },
          { id: 6, name: "Đỗ Văn Phúc", phone: "0956789012", email: "vanphuc@email.com", address: "Hà Nội", rating: 4.5, trips: 64, status: "active" },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    return status === "active"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusText = (status) => {
    return status === "active" ? "Hoạt động" : "Không hoạt động";
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone?.includes(searchTerm) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-800">Quản lý tài xế</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {drivers.length} tài xế</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
          <Plus size={20} />
          <span className="font-medium">Thêm tài xế</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
          >
            <div className="bg-linear-to-br from-blue-500 to-cyan-500 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{driver.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={16} className="fill-yellow-300 text-yellow-300" />
                      <span className="font-semibold">{driver.rating}</span>
                      <span className="text-white/80 text-sm">({driver.trips} chuyến)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={18} className="text-blue-500" />
                  <span className="text-sm">{driver.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={18} className="text-blue-500" />
                  <span className="text-sm">{driver.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={18} className="text-blue-500" />
                  <span className="text-sm">{driver.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-100 pt-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(driver.status)}`}>
                  {getStatusText(driver.status)}
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{driver.trips}</p>
                  <p className="text-xs text-gray-500">Chuyến đi</p>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all font-medium">
                <Eye size={18} />
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy tài xế nào</p>
        </div>
      )}
    </div>
  );
}
