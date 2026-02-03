import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  MdCalendarToday,
  MdArrowBack,
  MdLocationOn,
  MdPerson,
  MdPhone,
  MdEmail,
  MdAccessTime,
  MdCheckCircle,
  MdElectricCar,
  MdEvStation,
} from "react-icons/md";

// Sample car data (giống như Home)
const availableCars = [
  {
    id: 1,
    name: "VinFast VF8",
    description: "SUV điện • Tầm xa 400km",
    price: 1500,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600",
    badge: "TIẾT KIỆM",
    badgeColor: "from-emerald-400 to-teal-500",
    seats: 5,
    range: "400km",
  },
  {
    id: 2,
    name: "VinFast VF9",
    description: "SUV 7 chỗ • Tầm xa 450km",
    price: 2200,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600",
    badge: "MỚI",
    badgeColor: "from-sky-400 to-blue-500",
    seats: 7,
    range: "450km",
  },
  {
    id: 3,
    name: "Tesla Model 3",
    description: "Sedan thể thao • 0-100: 3.3s",
    price: 1800,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600",
    badge: "HOT",
    badgeColor: "from-orange-400 to-red-500",
    seats: 5,
    range: "500km",
  },
  {
    id: 4,
    name: "BMW iX",
    description: "SUV sang trọng • Tầm xa 600km",
    price: 2800,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600",
    badge: "CAO CẤP",
    badgeColor: "from-purple-400 to-pink-500",
    seats: 5,
    range: "600km",
  },
];

// Car Selection Card Component
const CarCard = ({ car, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(car)}
      className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group border-2 ${
        isSelected
          ? "border-sky-500 shadow-xl shadow-sky-200/50 scale-[1.02]"
          : "border-gray-100 hover:border-sky-200 hover:shadow-lg"
      }`}
    >
      {/* Badge */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${car.badgeColor} z-10`}
      >
        {car.badge}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-4 left-4 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center z-10 animate-fade-in">
          <MdCheckCircle className="text-white text-xl" />
        </div>
      )}

      {/* Image */}
      <div className="h-48 overflow-hidden bg-gray-100">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{car.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{car.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MdPerson className="text-sky-500" />
            <span>{car.seats} chỗ</span>
          </div>
          <div className="flex items-center gap-1">
            <MdEvStation className="text-emerald-500" />
            <span>{car.range}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              {car.price.toLocaleString()}₫
            </p>
            <p className="text-xs text-gray-500">/ ngày</p>
          </div>
          {isSelected && (
            <span className="text-sm font-semibold text-sky-600">Đã chọn</span>
          )}
        </div>
      </div>
    </div>
  );
};

CarCard.propTypes = {
  car: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Thông tin, 2: Xác nhận
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingData, setBookingData] = useState({
    pickupLocation: "",
    returnLocation: "",
    startDate: "",
    endDate: "",
    fullName: "",
    phone: "",
    email: "",
    note: "",
  });

  // Get car from navigation state or show car selection
  useEffect(() => {
    if (location.state?.selectedCar) {
      setSelectedCar(location.state.selectedCar);
    }
    // If no car selected, user can select from the list below
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    if (!selectedCar) return 0;
    return selectedCar.price * calculateDays() * 1000; // Convert K to full price
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    }
  };

  // If no car selected, show car selection UI
  if (!selectedCar) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
          >
            <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/40">
                <MdElectricCar className="text-2xl text-white" />
              </div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Chọn Xe Điện
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Vui lòng chọn xe bạn muốn thuê
            </p>
          </div>

          {/* Car Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isSelected={false}
                onSelect={() => setSelectedCar(car)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/40">
              <MdElectricCar className="text-2xl text-white" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              Đặt Xe Điện
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Trải nghiệm thuê xe điện hiện đại, thân thiện môi trường
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="flex items-center justify-center relative">
            {/* Progress Bar Background */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            <div
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500 -z-10 transition-all duration-500"
              style={{ width: step === 2 ? "100%" : "0%" }}
            ></div>

            {/* Step 1: Thông tin */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 1
                    ? "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/40"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 1 ? <MdCheckCircle className="text-xl" /> : "1"}
              </div>
              <span className="text-xs font-semibold text-gray-600">
                Thông tin
              </span>
            </div>

            {/* Step 2: Xác nhận */}
            <div className="flex flex-col items-center gap-2 ml-auto">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= 2
                    ? "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/40"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="text-xs font-semibold text-gray-600">
                Xác nhận
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Thông tin đặt xe */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <MdCalendarToday className="text-sky-500 text-3xl" />
                      Thông tin đặt xe
                    </h2>

                    <div className="space-y-6">
                      {/* Địa điểm */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <MdLocationOn className="inline text-sky-500 mr-1" />
                            Địa điểm nhận xe
                          </label>
                          <input
                            type="text"
                            name="pickupLocation"
                            value={bookingData.pickupLocation}
                            onChange={handleInputChange}
                            placeholder="Nhập địa điểm nhận xe"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <MdLocationOn className="inline text-emerald-500 mr-1" />
                            Địa điểm trả xe
                          </label>
                          <input
                            type="text"
                            name="returnLocation"
                            value={bookingData.returnLocation}
                            onChange={handleInputChange}
                            placeholder="Nhập địa điểm trả xe"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Thời gian */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <MdAccessTime className="inline text-sky-500 mr-1" />
                            Ngày nhận xe
                          </label>
                          <input
                            type="datetime-local"
                            name="startDate"
                            value={bookingData.startDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <MdAccessTime className="inline text-emerald-500 mr-1" />
                            Ngày trả xe
                          </label>
                          <input
                            type="datetime-local"
                            name="endDate"
                            value={bookingData.endDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Thông tin cá nhân */}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Thông tin liên hệ
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <MdPerson className="inline text-sky-500 mr-1" />
                              Họ và tên
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={bookingData.fullName}
                              onChange={handleInputChange}
                              placeholder="Nhập họ và tên"
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MdPhone className="inline text-sky-500 mr-1" />
                                Số điện thoại
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={bookingData.phone}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MdEmail className="inline text-sky-500 mr-1" />
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={bookingData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ghi chú (tùy chọn)
                            </label>
                            <textarea
                              name="note"
                              value={bookingData.note}
                              onChange={handleInputChange}
                              placeholder="Nhập ghi chú nếu có"
                              rows="3"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Tóm tắt đơn hàng
                    </h3>

                    {/* Car Info */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <div className="h-32 rounded-xl overflow-hidden mb-3">
                        <img
                          src={selectedCar.image}
                          alt={selectedCar.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-gray-900">
                        {selectedCar.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedCar.description}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giá thuê / ngày</span>
                        <span className="font-semibold">
                          {(selectedCar.price * 1000).toLocaleString()}₫
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Số ngày thuê</span>
                        <span className="font-semibold">
                          {calculateDays()} ngày
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">
                            Tổng cộng
                          </span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                            {calculateTotal().toLocaleString()}₫
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-all"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-sky-400/40 transition-all duration-300 hover:scale-105"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Xác nhận */}
          {step === 2 && (
            <div className="animate-fade-in max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-400/40 animate-pulse">
                  <MdCheckCircle className="text-4xl text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Đặt xe thành công!
                </h2>
                <p className="text-gray-600 mb-8">
                  Chúng tôi đã nhận được yêu cầu đặt xe của bạn. Thông tin chi
                  tiết đã được gửi đến email {bookingData.email}
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Thông tin đặt xe
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xe:</span>
                      <span className="font-semibold">{selectedCar.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nhận xe:</span>
                      <span className="font-semibold">
                        {bookingData.pickupLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trả xe:</span>
                      <span className="font-semibold">
                        {bookingData.returnLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-semibold">
                        {calculateDays()} ngày
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-gray-900">
                        Tổng tiền:
                      </span>
                      <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                        {calculateTotal().toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Link
                    to="/"
                    className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-gray-300 transition-all"
                  >
                    Về trang chủ
                  </Link>
                  <Link
                    to="/history"
                    className="px-8 py-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-full font-bold shadow-lg shadow-sky-400/40 transition-all duration-300 hover:scale-105"
                  >
                    Xem lịch sử
                  </Link>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Booking;
