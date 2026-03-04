import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthContext } from "../../context/AuthContext";
import { bookingService } from "../../services/api";
import {
  MdHistory,
  MdArrowBack,
  MdDirectionsCar,
  MdCalendarToday,
  MdLocationOn,
  MdAccessTime,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdStar,
  MdStarBorder,
  MdFilterList,
  MdSearch,
  MdElectricCar,
  MdEvStation,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdClose,
} from "react-icons/md";

// Map BE status (9 loại) → 4 nhóm hiển thị
const STATUS_GROUP = {
  pending: "pending",
  awaiting_deposit_confirmation: "awaiting_deposit",
  confirmed: "confirmed",
  vehicle_delivered: "ongoing",
  in_progress: "ongoing",
  vehicle_returned: "ongoing",
  completed: "completed",
  cancelled: "cancelled",
  deposit_lost: "cancelled",
};

// Normalize booking từ API về shape mà component dùng
const normalizeBooking = (b) => ({
  _id: b._id,
  id: b._id,
  vehicle: {
    name: b.vehicleId?.vehicleName ?? "Xe không xác định",
    image:
      b.vehicleId?.vehicleDetail?.vehicleImage ??
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
    type: b.vehicleId?.vehicleType ?? "",
  },
  startDate: b.startDate,
  endDate: b.endDate,
  pickupLocation: b.pickupLocation ?? "",
  returnLocation: b.dropoffLocation ?? "",
  totalPrice: Number(b.totalAmount) || 0,
  depositAmount: Number(b.depositAmount) || 0,
  status: b.status,
  displayStatus: STATUS_GROUP[b.status] ?? "pending",
  rentalType: b.rentalType,
  rating: null,
});

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "completed", label: "Hoàn thành" },
  { value: "ongoing", label: "Đang thuê" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "awaiting_deposit", label: "Chờ duyệt cọc" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "cancelled", label: "Đã hủy" },
];

// Status Badge Component — map toàn bộ BE status
const STATUS_BADGE_CONFIG = {
  pending: {
    icon: MdPending,
    text: "Chờ xác nhận",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
  },
  awaiting_deposit_confirmation: {
    icon: MdPending,
    text: "Chờ duyệt cọc",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  },
  confirmed: {
    icon: MdCheckCircle,
    text: "Đã xác nhận",
    bgColor: "bg-sky-100",
    textColor: "text-sky-600",
  },
  vehicle_delivered: {
    icon: MdAccessTime,
    text: "Đã giao xe",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  in_progress: {
    icon: MdAccessTime,
    text: "Đang thuê",
    bgColor: "bg-sky-100",
    textColor: "text-sky-600",
  },
  vehicle_returned: {
    icon: MdAccessTime,
    text: "Đã trả xe",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-600",
  },
  completed: {
    icon: MdCheckCircle,
    text: "Hoàn thành",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-600",
  },
  cancelled: {
    icon: MdCancel,
    text: "Đã hủy",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
  },
  deposit_lost: {
    icon: MdCancel,
    text: "Mất cọc",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
  },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_BADGE_CONFIG[status] ?? STATUS_BADGE_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.bgColor} ${config.textColor}`}
    >
      <Icon className={`text-sm ${config.textColor}`} />
      {config.text}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

// Star Rating Component
const StarRating = ({ rating, onRate, readonly }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            onClick={() => !readonly && onRate && onRate(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={`transition-all duration-200 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            {isFilled ? (
              <MdStar className="text-amber-400 text-xl" />
            ) : (
              <MdStarBorder className="text-gray-300 text-xl" />
            )}
          </button>
        );
      })}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
  onRate: PropTypes.func,
  readonly: PropTypes.bool,
};

// History Card Component
const HistoryCard = ({ booking, index, onViewDetails }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vehicle Image */}
          <div className="relative w-full lg:w-48 h-36 rounded-xl overflow-hidden shrink-0 group">
            <img
              src={booking.vehicle.image}
              alt={booking.vehicle.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-1.5">
              <MdElectricCar className="text-emerald-500 text-lg" />
            </div>
          </div>

          {/* Booking Details */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {booking.vehicle.name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MdEvStation className="text-emerald-500" />
                  {booking.vehicle.type}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
                  <MdCalendarToday className="text-sky-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Thời gian
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <MdLocationOn className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Điểm nhận xe
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {booking.pickupLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pt-4 border-t border-gray-100 grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <MdLocationOn className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      Điểm trả xe
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.returnLocation}
                    </p>
                  </div>
                </div>
                {booking.distance > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <MdDirectionsCar className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Quãng đường
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {booking.distance} km
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {booking.status === "completed" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Đánh giá:</span>
                    <StarRating rating={booking.rating} readonly />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-black text-gray-900">
                  {formatPrice(booking.totalPrice)}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    VNĐ
                  </span>
                </p>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sky-500 hover:text-sky-600 text-sm font-medium transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Thu gọn <MdKeyboardArrowUp />
                    </>
                  ) : (
                    <>
                      Chi tiết <MdKeyboardArrowDown />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HistoryCard.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vehicle: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    pickupLocation: PropTypes.string.isRequired,
    returnLocation: PropTypes.string.isRequired,
    totalPrice: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    rating: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onViewDetails: PropTypes.func,
};

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-20 animate-fade-in">
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 bg-sky-100 rounded-full animate-pulse"></div>
      <div className="absolute inset-4 bg-sky-50 rounded-full flex items-center justify-center">
        <MdHistory className="text-5xl text-sky-400" />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-gray-700 mb-3">
      Chưa có lịch sử thuê xe
    </h2>
    <p className="text-gray-500 max-w-md mx-auto mb-8">
      Bạn chưa có chuyến đi nào. Hãy bắt đầu khám phá đội xe điện cao cấp của
      chúng tôi!
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sky-500/30 transform hover:-translate-y-0.5"
    >
      <MdDirectionsCar className="text-xl" />
      Khám phá đội xe
    </Link>
  </div>
);

// Stats Summary Component
const StatsSummary = ({ bookings }) => {
  const completedTrips = bookings.filter((b) => b.status === "completed").length;
  const activeTrips = bookings.filter((b) =>
    ["confirmed", "vehicle_delivered", "in_progress", "vehicle_returned"].includes(b.status)
  ).length;
  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: "Tổng chuyến đi", value: bookings.length, color: "sky" },
        { label: "Hoàn thành", value: completedTrips, color: "emerald" },
        {
          label: "Tổng chi tiêu",
          value: totalSpent >= 1000000 ? `${formatPrice(Math.round(totalSpent / 1000000))}M` : formatPrice(totalSpent),
          color: "amber",
        },
        { label: "Đang thuê", value: activeTrips, color: "purple" },
      ].map((stat, index) => (
        <div
          key={stat.label}
          className={`bg-white rounded-2xl p-5 shadow-lg transform transition-all duration-500 hover:-translate-y-1 hover:shadow-xl animate-slide-up`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
          <p className={`text-3xl font-black text-${stat.color}-500`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

StatsSummary.propTypes = {
  bookings: PropTypes.array.isRequired,
};

const History = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user?._id) { setIsLoading(false); return; }
    setIsLoading(true);
    bookingService
      .getBookingsByCustomer(user._id)
      .then((res) => {
        const raw = res?.data ?? res ?? [];
        setBookings(Array.isArray(raw) ? raw.map(normalizeBooking) : []);
      })
      .catch((err) => {
        console.error("Lỗi tải lịch sử:", err);
        setError("Không thể tải lịch sử đặt xe. Vui lòng thử lại.");
      })
      .finally(() => setIsLoading(false));
  }, [user?._id]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter =
      activeFilter === "all" || booking.displayStatus === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      booking.vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-sky-200 rounded-full animate-spin border-t-sky-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MdHistory className="text-sky-500 text-xl animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">
            Đang tải lịch sử...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-white rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-300 rounded-full filter blur-[120px] animate-pulse"></div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-white/40 rounded-full animate-float"></div>
          <div
            className="absolute top-40 left-[30%] w-3 h-3 bg-white/30 rounded-full animate-float"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-16 right-[20%] w-2 h-2 bg-white/50 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
        >
          <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Quay lại trang chủ</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">
            Lịch Sử Thuê Xe
          </h1>
          <p className="text-white/80 text-lg">
            Theo dõi và quản lý các chuyến đi của bạn
          </p>
        </div>

        {/* Stats Summary */}
        <StatsSummary bookings={bookings} />

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên xe, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <MdClose />
                </button>
              )}
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700"
            >
              <MdFilterList />
              Bộ lọc
            </button>

            {/* Filter Buttons (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeFilter === option.value
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Filters */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              showFilters ? "max-h-40 mt-4" : "max-h-0"
            }`}
          >
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setActiveFilter(option.value);
                    setShowFilters(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeFilter === option.value
                      ? "bg-sky-500 text-white"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Booking List */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 mb-6">
            {error}
          </div>
        )}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => (
              <HistoryCard key={booking._id ?? booking.id} booking={booking} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <EmptyState />
          </div>
        )}

        {/* Results count */}
        {filteredBookings.length > 0 && (
          <p className="text-center text-gray-500 mt-8 animate-fade-in">
            Hiển thị {filteredBookings.length} trong tổng số {bookings.length}{" "}
            chuyến đi
          </p>
        )}
      </div>
    </div>
  );
};

export default History;
