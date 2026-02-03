import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Car, Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import { carService } from "../../services/api";

export default function Cars() {
  const { setBreadcrumb } = useOutletContext();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setBreadcrumb({ title: "Cars" });
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carService.getAllCars();
      setCars(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      // Fallback to mock data for demo
      setCars([
        { id: 1, name: "VinFast VF9", model: "VF9", brand: "VinFast", year: 2024, status: "available", price: 2500000, image: "🚙" },
        { id: 2, name: "VinFast VF8", model: "VF8", brand: "VinFast", year: 2024, status: "rented", price: 2000000, image: "🚗" },
        { id: 3, name: "Tesla Model 3", model: "Model 3", brand: "Tesla", year: 2023, status: "available", price: 3000000, image: "🚘" },
        { id: 4, name: "VinFast VF6", model: "VF6", brand: "VinFast", year: 2024, status: "maintenance", price: 1500000, image: "🚕" },
        { id: 5, name: "Tesla Model Y", model: "Model Y", brand: "Tesla", year: 2023, status: "available", price: 3500000, image: "🚙" },
        { id: 6, name: "VinFast VF5", model: "VF5", brand: "VinFast", year: 2024, status: "available", price: 1200000, image: "🚗" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      rented: "bg-blue-100 text-blue-700 border-blue-200",
      maintenance: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      available: "Sẵn sàng",
      rented: "Đang thuê",
      maintenance: "Bảo trì",
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredCars = cars.filter(car =>
    car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-800">Quản lý xe</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {cars.length} xe</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
          <Plus size={20} />
          <span className="font-medium">Thêm xe mới</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên xe, model, hãng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Filter size={20} />
            <span className="font-medium">Lọc</span>
          </button>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
          >
            {/* Car Image */}
            <div className="h-48 bg-linear-to-br from-blue-100 via-cyan-50 to-blue-50 flex items-center justify-center text-6xl relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{car.image}</span>
            </div>

            {/* Car Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {car.name}
                  </h3>
                  <p className="text-sm text-gray-500">{car.brand} • {car.year}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(car.status)}`}>
                  {getStatusText(car.status)}
                </span>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(car.price)}
                  <span className="text-sm text-gray-500 font-normal">/ngày</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Eye size={16} />
                  <span className="text-sm font-medium">Xem</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Edit size={16} />
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy xe nào</p>
        </div>
      )}
    </div>
  );
}
