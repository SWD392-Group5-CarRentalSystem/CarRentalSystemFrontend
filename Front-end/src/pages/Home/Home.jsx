import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  MdLocationOn,
  MdCalendarToday,
  MdVerifiedUser,
  MdTrendingDown,
  MdElectricCar,
  MdAccountBalanceWallet,
  MdAutoAwesome,
  MdSmartToy,
  MdDirectionsCar,
  MdEvStation,
} from "react-icons/md";

import heroBackground from "../../assets/videos/HomeVideo.mp4";
import { vehicleService } from "../../services/api";
import ChatWidget from "../../components/Chatbot/ChatWidget";

const POPULAR_LOCATIONS = [
  "Sân bay Tân Sơn Nhất, TP.HCM",
  "Sân bay Nội Bài, Hà Nội",
  "Sân bay Đà Nẵng",
  "Ga Sài Gòn, TP.HCM",
  "Ga Hà Nội",
  "Trung tâm Q.1, TP.HCM",
  "Trung tâm Hoàn Kiếm, Hà Nội",
  "Bãi biển Mỹ Khê, Đà Nẵng",
  "Vũng Tàu",
  "Đà Lạt",
  "Nha Trang",
  "Hội An",
];

const filterTabs = ["Tất cả", "SUV", "Sedan", "Crossover", "Coupe"];

// Car Card Component with stagger animations
const CarCard = ({ car, index, onBookNow }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`car-card-hover group cursor-pointer transform transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] mb-4 shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
        <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

        <img
          alt={car.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          src={car.image}
        />

        {car.badge && (
          <div className="absolute top-3 left-3 z-20">
            <span
              className={`${car.badgeColor} text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-lg animate-pulse`}
            >
              {car.badge}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <MdElectricCar className="text-emerald-500 text-lg" />
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => onBookNow(car)}
            className="px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300"
          >
            Đặt ngay
          </button>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-base text-gray-900 group-hover:text-sky-600 transition-colors duration-300">
            {car.name}
          </h3>
          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
            <MdEvStation className="text-emerald-500 text-sm" />
            {car.description}
          </p>
        </div>
        <div className="text-right">
          {car.price ? (
            <>
              <p className="text-[10px] text-gray-400 leading-none">từ</p>
              <p className="text-sm font-black text-sky-600 leading-tight">
                {(car.price * 1000).toLocaleString("vi-VN")}đ
              </p>
              <p className="text-[10px] text-gray-400">/ngày</p>
            </>
          ) : (
            <span className="text-xs font-bold text-sky-500 bg-sky-50 px-2 py-1 rounded-full">
              Liên hệ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

CarCard.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    badge: PropTypes.string,
    badgeColor: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onBookNow: PropTypes.func.isRequired,
};

const ServiceCard = ({ icon: Icon, title, description, iconBg }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-sky-200 hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-500 group transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
      >
        <Icon
          className={`text-3xl transition-transform duration-500 ${
            isHovered ? "scale-125" : "scale-100"
          }`}
        />
      </div>
      <h3 className="font-extrabold text-xl mb-4 group-hover:text-sky-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed font-light group-hover:text-gray-700 transition-colors duration-300">
        {description}
      </p>
    </div>
  );
};

ServiceCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconBg: PropTypes.string.isRequired,
};

const Home = () => {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [driveMode, setDriveMode] = useState("self");
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  const [chatOpen, setChatOpen] = useState(false);
  const [showAiTip, setShowAiTip] = useState(true);

  const navigate = useNavigate();

  const [searchForm, setSearchForm] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    startDate: "",
    endDate: "",
  });
  const [searchErrors, setSearchErrors] = useState({});
  const [showPickupSug, setShowPickupSug] = useState(false);
  const [showDropoffSug, setShowDropoffSug] = useState(false);

  const filteredPickupLocs = POPULAR_LOCATIONS.filter(
    (l) =>
      !searchForm.pickupLocation.trim() ||
      l.toLowerCase().includes(searchForm.pickupLocation.toLowerCase())
  );

  const filteredDropoffLocs = POPULAR_LOCATIONS.filter(
    (l) =>
      !searchForm.dropoffLocation.trim() ||
      l.toLowerCase().includes(searchForm.dropoffLocation.toLowerCase())
  );

  const updateSearch = (field, value) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }));
    setSearchErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const today = new Date().toISOString().split("T")[0];

  const autoFormatDate = (raw) => {
    let d = raw.replace(/[^0-9]/g, "");
    if (d.length > 8) d = d.slice(0, 8);
    if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
    if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return d;
  };

  const toISO = (dmy) => {
    const p = (dmy || "").split("/");
    return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : dmy;
  };

  const handleSearch = () => {
    const errs = {};
    if (!searchForm.pickupLocation.trim()) {
      errs.pickupLocation = "Vui lòng nhập điểm đón";
    }
    if (!searchForm.startDate || searchForm.startDate.length < 10) {
      errs.startDate = "Chọn ngày nhận xe (dd/mm/yyyy)";
    } else if (toISO(searchForm.startDate) < today) {
      errs.startDate = "Ngày nhận không thể là quá khứ";
    }
    if (!searchForm.endDate || searchForm.endDate.length < 10) {
      errs.endDate = "Chọn ngày trả xe (dd/mm/yyyy)";
    }
    if (
      searchForm.startDate &&
      searchForm.endDate &&
      searchForm.startDate.length === 10 &&
      searchForm.endDate.length === 10 &&
      toISO(searchForm.endDate) <= toISO(searchForm.startDate)
    ) {
      errs.endDate = "Ngày trả phải sau ngày nhận";
    }

    if (Object.keys(errs).length) {
      setSearchErrors(errs);
      return;
    }

    const searchData = {
      fromSearch: true,
      rentalType: driveMode === "driver" ? "with_driver" : "self_drive",
      pickupLocation: searchForm.pickupLocation,
      dropoffLocation: searchForm.dropoffLocation || searchForm.pickupLocation,
      startDate: toISO(searchForm.startDate),
      endDate: toISO(searchForm.endDate),
    };

    sessionStorage.setItem("bookingSearchData", JSON.stringify(searchData));
    navigate("/vehicles", { state: searchData });
  };

  useEffect(() => {
    vehicleService
      .getAllVehicles()
      .then((res) => {
        const data = Array.isArray(res)
          ? res
          : (res?.data?.data ?? res?.data ?? []);
        setVehicles(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to fetch vehicles:", err))
      .finally(() => setVehiclesLoading(false));
  }, []);

  const toCarCard = (v) => ({
    _id: v._id,
    id: v._id,
    name: v.vehicleName,
    description: `${v.vehicleType} • ${v.vehicleDetail?.vehicleSeatCount} chỗ`,
    image:
      v.vehicleDetail?.vehicleImage ||
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600",
    seats: v.vehicleDetail?.vehicleSeatCount,
    transmission: "Số tự động",
    fuel: "Điện",
    price: v.price ?? 0,
    badge: v.vehicleDetail?.vehicleYear >= 2024 ? "MỚI" : null,
    badgeColor: v.vehicleDetail?.vehicleYear >= 2024 ? "bg-sky-500" : null,
  });

  const filteredVehicleCards = (
    activeFilter === "Tất cả"
      ? vehicles
      : vehicles.filter((v) => v.vehicleType === activeFilter)
  )
    .slice(0, 8)
    .map(toCarCard);

  const handleBookNow = (car) => {
    navigate("/booking", { state: { selectedVehicle: car } });
  };

  const handleOpenChatFromTip = () => {
    setShowAiTip(false);
    setChatOpen(true);
    console.log("Opening chat from tip - chatOpen set to true");
  };

  const handleToggleChat = () => {
    setShowAiTip(false);
    setChatOpen((prev) => {
      console.log("Toggling chat from:", prev, "to:", !prev);
      return !prev;
    });
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 overflow-x-hidden pt-16">
      {/* AI Chat Button - Fixed */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {showAiTip && (
          <div
            onClick={handleOpenChatFromTip}
            className="cursor-pointer bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-[220px] animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-500">
                <MdSmartToy className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-medium leading-tight text-gray-800">
                  Cần tư vấn chọn xe điện phù hợp?
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChatFromTip();
                  }}
                  className="text-sky-500 text-[10px] font-bold mt-1 uppercase tracking-wider hover:underline"
                >
                  Chat với AI
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleToggleChat}
          className="ai-float w-14 h-14 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all relative"
        >
          <MdAutoAwesome className="text-2xl" />
        </button>
      </div>

      {/* Hero Section - Full Screen with parallax effect */}
      <section className="relative min-h-screen w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            src={heroBackground}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent animate-gradient-shift"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-sky-400 rounded-full animate-float-slow"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-float-slower"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-float-fast"></div>
          </div>
        </div>

        <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-80px)]">
            <div className="text-white py-12">
              <span className="inline-block px-4 py-1.5 rounded-md bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest mb-8">
                Trải Nghiệm Tương Lai
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] mb-8 tracking-tight">
                Lái Xe
                <br />
                <span className="text-sky-400">Điện</span>
                <br />
                Thông Minh.
              </h1>
              <p className="text-lg lg:text-xl text-white/70 max-w-md font-light leading-relaxed mb-10">
                Dịch vụ cho thuê xe điện cao cấp với hỗ trợ tư vấn chuyên nghiệp
                và tầm nhìn không thỏa hiệp cho du lịch sang trọng.
              </p>
              <div className="flex items-center gap-5">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                    <img
                      src="https://i.pravatar.cc/40?img=1"
                      alt="user"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                    <img
                      src="https://i.pravatar.cc/40?img=2"
                      alt="user"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                    +2K
                  </div>
                </div>
                <p className="text-sm font-medium text-white/70">
                  Được tin tưởng bởi hơn 2,000 khách hàng
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form - Floating between Hero and Fleet */}
      <div className="relative z-30 -mt-24 mb-8 px-4 lg:px-8 xl:px-12">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-5 lg:p-6 max-w-7xl mx-auto border border-white/50">
          <div className="inline-flex items-center gap-2 mb-4">
            <button
              onClick={() => setDriveMode("self")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                driveMode === "self"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MdDirectionsCar className="text-base" />
              Tự lái
            </button>
            <button
              onClick={() => setDriveMode("driver")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                driveMode === "driver"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MdVerifiedUser className="text-base" />
              Có tài xế
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Điểm đón
                </label>
                <div
                  className={`flex items-center gap-2 bg-gray-50/80 border rounded-xl px-3 py-2.5 group focus-within:bg-white transition-all ${
                    searchErrors.pickupLocation
                      ? "border-red-400 bg-red-50/30"
                      : "border-gray-200 focus-within:border-sky-500"
                  }`}
                >
                  <MdLocationOn className="text-gray-400 text-lg group-focus-within:text-sky-500 shrink-0" />
                  <input
                    className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium placeholder:text-gray-400 outline-none"
                    placeholder="Thành phố hoặc sân bay"
                    type="text"
                    value={searchForm.pickupLocation}
                    onChange={(e) =>
                      updateSearch("pickupLocation", e.target.value)
                    }
                    onFocus={() => setShowPickupSug(true)}
                    onBlur={() => setTimeout(() => setShowPickupSug(false), 150)}
                  />
                </div>
                {searchErrors.pickupLocation && (
                  <p className="text-red-500 text-[10px] mt-1 font-medium">
                    {searchErrors.pickupLocation}
                  </p>
                )}
                {showPickupSug && filteredPickupLocs.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                    {filteredPickupLocs.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onMouseDown={() => {
                          updateSearch("pickupLocation", loc);
                          setShowPickupSug(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2 transition-colors"
                      >
                        <MdLocationOn className="text-sky-400 shrink-0 text-base" />
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Điểm trả
                </label>
                <div className="flex items-center gap-2 bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2.5 group focus-within:border-sky-500 focus-within:bg-white transition-all">
                  <MdLocationOn className="text-gray-400 text-lg group-focus-within:text-sky-500 shrink-0" />
                  <input
                    className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium placeholder:text-gray-400 outline-none"
                    placeholder="Giống điểm đón"
                    type="text"
                    value={searchForm.dropoffLocation}
                    onChange={(e) =>
                      updateSearch("dropoffLocation", e.target.value)
                    }
                    onFocus={() => setShowDropoffSug(true)}
                    onBlur={() =>
                      setTimeout(() => setShowDropoffSug(false), 150)
                    }
                  />
                </div>
                {showDropoffSug && filteredDropoffLocs.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                    {filteredDropoffLocs.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onMouseDown={() => {
                          updateSearch("dropoffLocation", loc);
                          setShowDropoffSug(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2 transition-colors"
                      >
                        <MdLocationOn className="text-sky-400 shrink-0 text-base" />
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Ngày nhận xe
                </label>
                <div
                  className={`flex items-center gap-2 bg-gray-50/80 border rounded-xl px-3 py-2.5 focus-within:bg-white transition-all ${
                    searchErrors.startDate
                      ? "border-red-400 bg-red-50/30"
                      : "border-gray-200 focus-within:border-sky-500"
                  }`}
                >
                  <MdCalendarToday className="text-gray-400 text-base shrink-0" />
                  <input
                    className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium outline-none"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                    value={searchForm.startDate}
                    onChange={(e) =>
                      updateSearch("startDate", autoFormatDate(e.target.value))
                    }
                  />
                </div>
                {searchErrors.startDate && (
                  <p className="text-red-500 text-[10px] mt-1 font-medium">
                    {searchErrors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Ngày trả xe
                </label>
                <div
                  className={`flex items-center gap-2 bg-gray-50/80 border rounded-xl px-3 py-2.5 focus-within:bg-white transition-all ${
                    searchErrors.endDate
                      ? "border-red-400 bg-red-50/30"
                      : "border-gray-200 focus-within:border-sky-500"
                  }`}
                >
                  <MdCalendarToday className="text-gray-400 text-base shrink-0" />
                  <input
                    className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium outline-none"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                    value={searchForm.endDate}
                    onChange={(e) =>
                      updateSearch("endDate", autoFormatDate(e.target.value))
                    }
                  />
                </div>
                {searchErrors.endDate && (
                  <p className="text-red-500 text-[10px] mt-1 font-medium">
                    {searchErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="shrink-0 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3 px-8 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sky-500/30 flex items-center justify-center gap-2 group"
            >
              <span>Tìm xe</span>
              <MdDirectionsCar className="text-lg group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <section className="py-12 lg:py-20 bg-white w-full" id="fleet">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight italic mb-3">
                Đội Xe Cao Cấp
              </h2>
              <p className="text-gray-500 text-base lg:text-lg">
                Xe điện hiệu suất cao, tuyển chọn dành cho khách hàng thượng lưu.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === tab
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {vehiclesLoading ? (
              <div className="col-span-4 flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
              </div>
            ) : filteredVehicleCards.length > 0 ? (
              filteredVehicleCards.map((car, index) => (
                <CarCard
                  key={car.id}
                  car={car}
                  index={index}
                  onBookNow={handleBookNow}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-16 text-gray-400">
                Không có xe nào
              </div>
            )}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-gray-300 rounded-full font-semibold text-sm hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-all duration-300 transform hover:scale-105 group"
            >
              <span>Xem Toàn Bộ ({vehicles.length} xe)</span>
              <MdDirectionsCar className="text-lg group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gray-50 w-full">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="text-center mb-14">
            <span className="text-sky-500 font-bold text-xs uppercase tracking-[0.25em]">
              Trải Nghiệm
            </span>
            <h2 className="text-3xl lg:text-4xl font-black mt-4 mb-4">
              Dịch Vụ Cao Cấp
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Chúng tôi tối ưu hóa mọi quy trình để bạn tập trung vào hành trình.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              icon={MdVerifiedUser}
              title="Bảo Hiểm Toàn Diện"
              description="Bảo hiểm va chạm, trách nhiệm và hỗ trợ cứu hộ 24/7 đi kèm với gói không khấu trừ."
              iconBg="bg-sky-500/10 text-sky-500"
            />
            <ServiceCard
              icon={MdTrendingDown}
              title="Giá Thông Minh"
              description="Hệ thống AI phân tích dữ liệu thời gian thực để đưa ra mức giá cạnh tranh nhất."
              iconBg="bg-emerald-500/10 text-emerald-500"
            />
            <ServiceCard
              icon={MdEvStation}
              title="Sạc Nhanh"
              description="Truy cập tất cả trạm sạc với chìa khóa số tích hợp. Không cần ứng dụng hay thẻ riêng."
              iconBg="bg-sky-500/10 text-sky-500"
            />
            <ServiceCard
              icon={MdAccountBalanceWallet}
              title="Thanh Toán Minh Bạch"
              description="Một hóa đơn minh bạch hàng tháng. Không phí ẩn, không phụ thu."
              iconBg="bg-sky-500/10 text-sky-500"
            />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 w-full">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-gray-900 text-white py-20 lg:py-32 px-8 lg:px-16 text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500 rounded-full filter blur-[150px]"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full filter blur-[150px]"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Hành Trình Xanh
                <br />
                Đang Chờ Bạn.
              </h2>
              <p className="text-white/60 mb-10 max-w-xl mx-auto text-base lg:text-lg font-light">
                Tham gia cộng đồng xe điện cao cấp và tận hưởng trải nghiệm di
                chuyển mới.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/vehicles"
                  className="px-10 py-4 bg-sky-500 hover:bg-sky-600 rounded-full font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  Khám Phá Đội Xe
                </Link>
                <button className="px-10 py-4 bg-white text-gray-900 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors">
                  Liên Hệ Tư Vấn
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#101929] py-16 w-full">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-400/40">
                  <MdElectricCar className="text-[22px]" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">
                  EV Rental System
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Hệ thống cho thuê xe điện cao cấp. Cùng chúng tôi xây dựng một
                thế giới xanh hơn.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-sky-500 hover:scale-110 transition-all duration-300"
                >
                  <span className="text-sm">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-sky-500 hover:scale-110 transition-all duration-300"
                >
                  <span className="text-sm">in</span>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-sky-500 hover:scale-110 transition-all duration-300"
                >
                  <span className="text-sm">📷</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-sky-400 mb-4">
                Trải Nghiệm
              </h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Tự Lái Du Lịch</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Dịch Vụ Tài Xế</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Đội Xe Doanh Nghiệp</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Thành Viên VIP</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-sky-400 mb-4">
                Tài Nguyên
              </h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Triết Lý Của Chúng Tôi</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Báo Cáo Môi Trường</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Mạng Lưới Sạc</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Tin Tức Báo Chí</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-sky-400 mb-4">
                Hỗ Trợ
              </h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Tư Vấn 24/7</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Điều Khoản Thuê Xe</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Chính Sách Bảo Mật</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Trung Tâm Liên Hệ</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs">
              © 2026 EV Rental System · Hệ Thống Hoạt Động Ổn Định
            </p>
            <div className="flex gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-sky-400 transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-sky-400 transition-colors">Chính sách</a>
              <a href="#" className="hover:text-sky-400 transition-colors">Liên hệ</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .car-card-hover {
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .car-card-hover:hover {
          transform: translateY(-12px) scale(1.02);
        }

        @keyframes subtle-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 15px); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -25px); }
        }

        .ai-float {
          animation: subtle-float 4s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 6s ease-in-out infinite;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        @keyframes slow-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.3); }
          50% { box-shadow: 0 0 40px rgba(14, 165, 233, 0.6); }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <ChatWidget isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Home;