import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Car, Search, Eye, X } from "lucide-react";
import { MdDirectionsCar, MdInfo, MdShield } from "react-icons/md";
import { vehicleService } from "../../services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  available:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  unavailable: "bg-red-100 text-red-700 border-red-200",
  rented:      "bg-blue-100 text-blue-700 border-blue-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
};
const STATUS_TEXT = {
  available:   "Sẵn sàng",
  unavailable: "Không sẵn",
  rented:      "Đang thuê",
  maintenance: "Bảo trì",
};
const getStatusKey = (v) => {
  if (v.vehicleStatus === false) return "unavailable";
  if (v.vehicleStatus === true)  return "available";
  return v.status || "available";
};
const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function VehicleDetailModal({ vehicle, onClose }) {
  const sk = getStatusKey(vehicle);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="relative h-48 bg-linear-to-br from-indigo-100 via-blue-50 to-cyan-50 overflow-hidden">
          {vehicle.vehicleDetail?.vehicleImage ? (
            <img src={vehicle.vehicleDetail.vehicleImage} alt={vehicle.vehicleName}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🚗</div>
          )}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors">
            <X size={16} />
          </button>
          <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLE[sk]}`}>
            {STATUS_TEXT[sk]}
          </span>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">{vehicle.vehicleName}</h2>
          <p className="text-sm text-gray-500 mb-4">{vehicle.vehicleDetail?.vehicleBrands} · {vehicle.vehicleDetail?.vehicleYear}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Loại xe",       value: vehicle.vehicleType },
              { label: "Màu sắc",       value: vehicle.vehicleDetail?.vehicleColor },
              { label: "Biển số",       value: vehicle.vehicleDetail?.vehicleLicensePlate },
              { label: "Số chỗ",        value: vehicle.vehicleDetail?.vehicleSeatCount ? `${vehicle.vehicleDetail.vehicleSeatCount} chỗ` : undefined },
              { label: "Giá/ngày",      value: fmtVND(Number(vehicle.price) * 1000 || 0), full: true },
            ].filter(r => r.value).map(({ label, value, full }) => (
              <div key={label} className={`bg-gray-50 rounded-xl px-3 py-2.5 ${full ? "col-span-2" : ""}`}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Read-only notice */}
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-600 font-medium">
            <MdShield className="text-lg shrink-0" />
            Bạn chỉ có quyền xem. Liên hệ quản lý để chỉnh sửa thông tin xe.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StaffCars() {
  const { setBreadcrumb } = useOutletContext();
  const [vehicles, setVehicles]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterType, setFilterType]   = useState("all");
  const [detailVehicle, setDetailVehicle] = useState(null);

  useEffect(() => { setBreadcrumb({ title: "Quản lý xe" }); }, [setBreadcrumb]);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vehicleService.getAllVehicles();
      setVehicles(res.data || []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const types = ["all", ...new Set(vehicles.map((v) => v.vehicleType).filter(Boolean))];

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      v.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleDetail?.vehicleBrands?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleDetail?.vehicleLicensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "all" || v.vehicleType === filterType;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Đang tải dữ liệu xe...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách xe</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {vehicles.length} xe · <span className="font-medium text-indigo-600">Chế độ xem</span>
          </p>
        </div>
        {/* Read-only badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 rounded-xl text-xs text-indigo-700 font-semibold border border-indigo-100">
          <MdInfo className="text-base" />
          Chỉ xem — chỉnh sửa do Quản lý thực hiện
        </div>
      </div>

      {/* Search & filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Tìm theo tên, biển số, hãng xe..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-indigo-300 outline-none bg-white">
          <option value="all">Tất cả loại</option>
          {types.filter((t) => t !== "all").map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng cộng",   value: vehicles.length,                                                          color: "indigo" },
          { label: "Sẵn sàng",    value: vehicles.filter((v) => getStatusKey(v) === "available").length,            color: "emerald" },
          { label: "Đang thuê",   value: vehicles.filter((v) => getStatusKey(v) === "rented").length,               color: "blue" },
          { label: "Bảo trì",     value: vehicles.filter((v) => ["maintenance","unavailable"].includes(getStatusKey(v))).length, color: "amber" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black text-${color}-700`}>{value}</p>
            <p className={`text-xs font-semibold text-${color}-500 mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Vehicle grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((vehicle) => {
          const sk = getStatusKey(vehicle);
          return (
            <div key={vehicle._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              {/* Image */}
              <div className="h-44 bg-linear-to-br from-indigo-50 via-blue-50 to-cyan-50 relative overflow-hidden">
                {vehicle.vehicleDetail?.vehicleImage ? (
                  <img src={vehicle.vehicleDetail.vehicleImage} alt={vehicle.vehicleName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🚗</div>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLE[sk]}`}>
                  {STATUS_TEXT[sk]}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {vehicle.vehicleName}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 mb-3">
                  {vehicle.vehicleDetail?.vehicleBrands} · {vehicle.vehicleDetail?.vehicleYear}
                  {vehicle.vehicleDetail?.vehicleSeatCount ? ` · ${vehicle.vehicleDetail.vehicleSeatCount} chỗ` : ""}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-indigo-600">
                    {fmtVND(Number(vehicle.price) * 1000 || 0)}
                    <span className="text-[11px] font-normal text-gray-400 ml-1">/ngày</span>
                  </p>
                  <button onClick={() => setDetailVehicle(vehicle)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors">
                    <Eye size={14} /> Chi tiết
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Car size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">Không tìm thấy xe phù hợp</p>
        </div>
      )}

      {detailVehicle && (
        <VehicleDetailModal vehicle={detailVehicle} onClose={() => setDetailVehicle(null)} />
      )}
    </div>
  );
}
