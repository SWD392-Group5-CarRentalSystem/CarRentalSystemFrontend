import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  MdSearch,
  MdGridView,
  MdViewList,
  MdElectricCar,
  MdTune,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdAirlineSeatReclineNormal,
  MdCalendarToday,
  MdPalette,
  MdBolt,
  MdCreditCard,
  MdCheckCircle,
} from "react-icons/md";

import { vehicleService } from "../../services/api";

const CATEGORIES = ["Tất cả", "SUV", "Sedan", "Crossover", "Coupe"];
const BRANDS = ["Tất cả", "VinFast", "Tesla", "BMW", "Audi", "Hyundai", "Kia", "Porsche", "Mercedes", "Lucid"];
const SORT_OPTIONS = [
  { value: "az",         label: "Tên A → Z" },
  { value: "za",         label: "Tên Z → A" },
  { value: "seats_desc", label: "Nhiều chỗ nhất" },
  { value: "year_desc",  label: "Năm mới nhất" },
];
const VEHICLES_PER_PAGE = 9;

const defaultFilters = { category: "Tất cả", brand: "Tất cả", availableOnly: false };

// Grid Card
const VehicleGridCard = ({ vehicle, onBookNow }) => (
  <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100 hover:-translate-y-1 ${!vehicle.vehicleStatus ? "opacity-55" : ""}`}>
    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <img
        src={vehicle.vehicleDetail.vehicleImage}
        alt={vehicle.vehicleName}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600"; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-white/30">
        {vehicle.vehicleType}
      </span>
      <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
        <MdElectricCar className="text-white text-sm" />
      </div>
      {!vehicle.vehicleStatus && (
        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
          <span className="bg-red-500/90 backdrop-blur-sm text-white font-bold px-5 py-2 rounded-full text-sm shadow-xl tracking-wide">
            Hết xe
          </span>
        </div>
      )}
      {vehicle.vehicleStatus && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => onBookNow(vehicle)}
            className="px-7 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full shadow-2xl text-sm transition-all duration-200 cursor-pointer scale-90 group-hover:scale-100 border border-white/20"
          >
            Đặt ngay
          </button>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-bold text-white text-base leading-tight drop-shadow-lg">{vehicle.vehicleName}</h3>
        <p className="text-white/70 text-xs mt-0.5">{vehicle.vehicleDetail.vehicleBrands} · {vehicle.vehicleDetail.vehicleYear}</p>
      </div>
    </div>
    <div className="px-4 py-3 flex items-center justify-between bg-gray-50/80 border-t border-gray-100">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MdAirlineSeatReclineNormal className="text-sky-400 text-sm" />
          {vehicle.vehicleDetail.vehicleSeatCount} chỗ
        </span>
        <span className="flex items-center gap-1">
          <MdPalette className="text-indigo-400 text-sm" />
          {vehicle.vehicleDetail.vehicleColor}
        </span>
      </div>
      <div className="text-right">
        {vehicle.price ? (
          <p className="text-sm font-black text-sky-600">
            {(vehicle.price * 1000).toLocaleString("vi-VN")}đ<span className="text-[10px] font-normal text-gray-400">/ngày</span>
          </p>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-md">
            {vehicle.vehicleDetail.vehicleLicensePlate}
          </span>
        )}
      </div>
    </div>
  </div>
);
VehicleGridCard.propTypes = { vehicle: PropTypes.object.isRequired, onBookNow: PropTypes.func.isRequired };

// List Card
const VehicleListCard = ({ vehicle, onBookNow }) => (
  <div className={`group bg-white rounded-2xl border border-gray-100 hover:border-sky-200 hover:shadow-xl transition-all duration-300 overflow-hidden ${!vehicle.vehicleStatus ? "opacity-55" : ""}`}>
    <div className="flex">
      <div className="relative w-52 flex-shrink-0 overflow-hidden bg-gray-100">
        <img
          src={vehicle.vehicleDetail.vehicleImage}
          alt={vehicle.vehicleName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          style={{ minHeight: "160px" }}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
        <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {vehicle.vehicleType}
        </span>
        {!vehicle.vehicleStatus && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Hết xe</span>
          </div>
        )}
      </div>
      <div className="flex-1 px-6 py-5 flex flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-sky-600 transition-colors">{vehicle.vehicleName}</h3>
            <p className="text-gray-400 text-sm mt-0.5">{vehicle.vehicleDetail.vehicleBrands} · {vehicle.vehicleDetail.vehicleYear}</p>
          </div>
          {vehicle.vehicleStatus && (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0">
              <MdCheckCircle className="text-sm" /> Có sẵn
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><MdAirlineSeatReclineNormal className="text-sky-400" />{vehicle.vehicleDetail.vehicleSeatCount} chỗ</span>
            <span className="flex items-center gap-1.5"><MdCalendarToday className="text-sky-400" />{vehicle.vehicleDetail.vehicleYear}</span>
            <span className="flex items-center gap-1.5"><MdPalette className="text-indigo-400" />{vehicle.vehicleDetail.vehicleColor}</span>
            <span className="flex items-center gap-1.5"><MdCreditCard className="text-gray-400" /><span className="font-mono">{vehicle.vehicleDetail.vehicleLicensePlate}</span></span>
          </div>
          <div className="flex-shrink-0 ml-4 flex items-center gap-4">
            {vehicle.price ? (
              <div className="text-right">
                <p className="text-base font-black text-sky-600">{(vehicle.price * 1000).toLocaleString("vi-VN")}đ</p>
                <p className="text-[10px] text-gray-400 leading-none">/ngày</p>
              </div>
            ) : null}
            <button
              onClick={() => onBookNow(vehicle)}
              disabled={!vehicle.vehicleStatus}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                vehicle.vehicleStatus
                  ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sm hover:shadow-sky-200 hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {vehicle.vehicleStatus ? "Đặt ngay" : "Hết xe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
VehicleListCard.propTypes = { vehicle: PropTypes.object.isRequired, onBookNow: PropTypes.func.isRequired };

// Filter Chip
const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
      active ? "bg-sky-500 text-white shadow-sm shadow-sky-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);
FilterChip.propTypes = { label: PropTypes.string.isRequired, active: PropTypes.bool.isRequired, onClick: PropTypes.func.isRequired };

// Sidebar Filter
const SidebarFilter = ({ filters, setFilters }) => {
  const update = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Loại xe</p>
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => update("category", c)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                filters.category === c ? "bg-sky-50 text-sky-600 border border-sky-200" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-gray-100" />
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Thương hiệu</p>
        <div className="space-y-1">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => update("brand", b)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                filters.brand === b ? "bg-sky-50 text-sky-600 border border-sky-200" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-gray-100" />
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={`w-10 h-5 rounded-full transition-colors duration-200 relative flex-shrink-0 ${filters.availableOnly ? "bg-sky-500" : "bg-gray-200"}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${filters.availableOnly ? "left-5" : "left-0.5"}`} />
          <input type="checkbox" className="sr-only" checked={filters.availableOnly} onChange={(e) => update("availableOnly", e.target.checked)} />
        </div>
        <span className="text-sm font-medium text-gray-700">Chỉ xe có sẵn</span>
      </label>
      <button
        onClick={() => setFilters(defaultFilters)}
        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
};
SidebarFilter.propTypes = { filters: PropTypes.object.isRequired, setFilters: PropTypes.func.isRequired };

// Main Component
const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("az");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await vehicleService.getAllVehicles();
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setVehicles(list);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
        setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((v) =>
        v.vehicleName.toLowerCase().includes(q) ||
        v.vehicleDetail.vehicleBrands.toLowerCase().includes(q) ||
        v.vehicleDetail.vehicleColor.toLowerCase().includes(q)
      );
    }
    if (filters.category !== "Tất cả") result = result.filter((v) => v.vehicleType === filters.category);
    if (filters.brand !== "Tất cả") result = result.filter((v) => v.vehicleDetail.vehicleBrands === filters.brand);
    if (filters.availableOnly) result = result.filter((v) => v.vehicleStatus);
    switch (sortBy) {
      case "za":         result.sort((a, b) => b.vehicleName.localeCompare(a.vehicleName)); break;
      case "seats_desc": result.sort((a, b) => b.vehicleDetail.vehicleSeatCount - a.vehicleDetail.vehicleSeatCount); break;
      case "year_desc":  result.sort((a, b) => b.vehicleDetail.vehicleYear - a.vehicleDetail.vehicleYear); break;
      default:           result.sort((a, b) => a.vehicleName.localeCompare(b.vehicleName));
    }
    return result;
  }, [searchQuery, filters, sortBy, vehicles]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, sortBy]);

  const totalPages = Math.ceil(filteredVehicles.length / VEHICLES_PER_PAGE);
  const pagedVehicles = filteredVehicles.slice((currentPage - 1) * VEHICLES_PER_PAGE, currentPage * VEHICLES_PER_PAGE);
  const handleBookNow = (vehicle) => navigate("/booking", { state: { selectedVehicle: vehicle } });
  const goToPage = (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const availableCount = vehicles.filter((v) => v.vehicleStatus).length;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">

      {/* Hero */}
      <div className="relative overflow-hidden pt-16 bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        {/* Decorative circle bg */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-100/60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-100/40 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center gap-8 px-8 lg:px-16 py-14 lg:py-16">

          {/* Left — text */}
          <div className="flex-1 min-w-0 z-10">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-100 text-sky-600 text-xs font-bold rounded-full uppercase tracking-widest mb-5">
              <MdBolt className="text-sm" /> Xe Điện Cao Cấp
            </span>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
              Khám phá kho xe<br />
              <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                điện đẳng cấp
              </span>
            </h1>

            <p className="text-gray-500 text-base leading-relaxed max-w-md mb-8">
              Bộ sưu tập xe điện hiện đại từ các thương hiệu hàng đầu thế giới — sang trọng, tiết kiệm và thân thiện với môi trường.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              {[
                { label: "Xe có sẵn",   value: loading ? "—" : availableCount, icon: "🚗" },
                { label: "Thương hiệu", value: BRANDS.length - 1,              icon: "🏷️" },
                { label: "Loại xe",     value: CATEGORIES.length - 1,          icon: "⚡" },
              ].map((s, i) => (
                <div key={s.label} className={`flex flex-col items-center px-5 py-3 rounded-2xl bg-white shadow-sm border border-gray-100 min-w-[90px] ${i === 0 ? "border-sky-100 shadow-sky-100/50" : ""}`}>
                  <span className="text-xl mb-0.5">{s.icon}</span>
                  <span className="text-2xl font-black text-gray-900">{s.value}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 text-center">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — car image */}
          <div className="flex-shrink-0 w-full lg:w-[48%] relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-sky-200/40">
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=900&q=85"
                alt="EV car showcase"
                className="w-full h-64 lg:h-80 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-transparent" />
            </div>
            {/* Floating tag */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">⚡</div>
              <div>
                <div className="text-xs text-gray-400 font-medium">100% Xe điện</div>
                <div className="text-sm font-bold text-gray-800">Không khí thải</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Tìm theo tên, thương hiệu, màu sắc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <MdClose className="text-base" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-sky-400 outline-none cursor-pointer hover:bg-white transition-colors"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
            {[{ mode: "grid", Icon: MdGridView }, { mode: "list", Icon: MdViewList }].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === mode ? "bg-white text-sky-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Icon className="text-xl" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-white transition-colors cursor-pointer"
          >
            <MdTune className="text-lg" /> Lọc
          </button>
        </div>
        <div className="px-6 lg:px-8 pb-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-800">{filteredVehicles.length}</span> xe
            {totalPages > 1 && <span className="text-gray-400"> · Trang {currentPage}/{totalPages}</span>}
          </span>
          {filters.category !== "Tất cả" && (
            <FilterChip label={filters.category} active onClick={() => setFilters(f => ({ ...f, category: "Tất cả" }))} />
          )}
          {filters.brand !== "Tất cả" && (
            <FilterChip label={filters.brand} active onClick={() => setFilters(f => ({ ...f, brand: "Tất cả" }))} />
          )}
          {filters.availableOnly && (
            <FilterChip label="Có sẵn" active onClick={() => setFilters(f => ({ ...f, availableOnly: false }))} />
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-sky-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Đang tải danh sách xe...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-gray-600 font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-400 transition cursor-pointer shadow-sm">
            Thử lại
          </button>
        </div>
      )}

      {/* Main layout */}
      {!loading && !error && (
        <div className="flex min-h-[calc(100vh-200px)]">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 bg-white border-r border-gray-200 sticky top-[105px] h-[calc(100vh-105px)] overflow-y-auto">
            <div className="p-5 flex-1">
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-gray-900 text-sm">Bộ lọc</span>
                <button onClick={() => setFilters(defaultFilters)} className="text-xs text-sky-500 hover:text-sky-600 font-medium cursor-pointer">
                  Xóa tất cả
                </button>
              </div>
              <SidebarFilter filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Mobile Drawer */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)} />
              <div className="relative w-72 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <span className="font-bold text-gray-900">Bộ lọc</span>
                  <button onClick={() => setShowMobileFilter(false)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <MdClose className="text-gray-600 text-lg" />
                  </button>
                </div>
                <div className="p-5 flex-1">
                  <SidebarFilter filters={filters} setFilters={setFilters} />
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button onClick={() => setShowMobileFilter(false)} className="w-full py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-400 transition cursor-pointer">
                    Xem kết quả ({filteredVehicles.length} xe)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <main className="flex-1 min-w-0 px-6 lg:px-8 py-8">
            {pagedVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl">🚗</div>
                <h3 className="text-lg font-bold text-gray-700">Không tìm thấy xe phù hợp</h3>
                <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={() => { setFilters(defaultFilters); setSearchQuery(""); }}
                  className="mt-2 px-6 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-400 transition cursor-pointer shadow-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {pagedVehicles.map((v) => (
                      <VehicleGridCard key={v._id || v.vehicleDetail.vehicleLicensePlate} vehicle={v} onBookNow={handleBookNow} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pagedVehicles.map((v) => (
                      <VehicleListCard key={v._id || v.vehicleDetail.vehicleLicensePlate} vehicle={v} onBookNow={handleBookNow} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 pb-4">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      <MdChevronLeft className="text-xl" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm ${
                          currentPage === p
                            ? "bg-sky-500 text-white shadow-sky-200 shadow-md scale-110"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-500"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      <MdChevronRight className="text-xl" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
