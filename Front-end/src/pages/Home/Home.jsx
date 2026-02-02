import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthContext } from "../../context";
import {
  MdLocationOn,
  MdCalendarToday,
  MdVerifiedUser,
  MdTrendingDown,
  MdElectricCar,
  MdAccountBalanceWallet,
  MdAutoAwesome,
  MdSmartToy,
  MdMenu,
  MdLogout,
  MdPerson,
  MdHistory,
  MdDirectionsCar,
  MdEvStation,
} from "react-icons/md";

import heroBackground from "../../assets/images/home1.jpg";

// Sample car data
const carsData = [
  {
    id: 1,
    name: "VinFast VF8",
    description: "SUV điện • Tầm xa 400km",
    price: 1500,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600",
    badge: "TIẾT KIỆM",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 2,
    name: "VinFast VF9",
    description: "SUV 7 chỗ • Tầm xa 450km",
    price: 2200,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600",
    badge: "MỚI",
    badgeColor: "bg-sky-500",
  },
  {
    id: 3,
    name: "Tesla Model 3",
    description: "Sedan thể thao • 0-100: 3.3s",
    price: 1800,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600",
    badge: "HOT",
    badgeColor: "bg-amber-500",
  },
  {
    id: 4,
    name: "Tesla Model Y",
    description: "SUV 7 chỗ • Dẫn động 4 bánh",
    price: 2000,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600",
    badge: null,
    badgeColor: null,
  },
  {
    id: 5,
    name: "Hyundai Ioniq 5",
    description: "Crossover điện • Tầm xa 380km",
    price: 1600,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600",
    badge: null,
    badgeColor: null,
  },
  {
    id: 6,
    name: "Kia EV6",
    description: "GT-Line • 0-100: 5.2s",
    price: 1700,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600",
    badge: null,
    badgeColor: null,
  },
  {
    id: 7,
    name: "Mercedes EQS",
    description: "Sedan hạng sang • Tầm xa 700km",
    price: 4500,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600",
    badge: null,
    badgeColor: null,
  },
  {
    id: 8,
    name: "BMW iX",
    description: "SAV điện • Công nghệ tự lái",
    price: 3800,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600",
    badge: null,
    badgeColor: null,
  },
];

const filterTabs = ["Tất cả", "Sedan", "SUV", "Thể thao", "Hạng sang"];

// Car Card Component
const CarCard = ({ car }) => (
  <div className="car-card-hover group cursor-pointer">
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] mb-4">
      <img
        alt={car.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        src={car.image}
      />
      {/* Badge */}
      {car.badge && (
        <div className="absolute top-3 left-3">
          <span
            className={`${car.badgeColor} text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider`}
          >
            {car.badge}
          </span>
        </div>
      )}
    </div>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-base text-gray-900">{car.name}</h3>
        <p className="text-gray-400 text-xs mt-0.5">{car.description}</p>
      </div>
      <div className="text-right">
        <span className="text-lg font-black text-sky-500">{car.price}K</span>
        <span className="text-[10px] text-gray-400 font-medium block uppercase">
          VNĐ/ngày
        </span>
      </div>
    </div>
  </div>
);

CarCard.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    badge: PropTypes.string,
    badgeColor: PropTypes.string,
  }).isRequired,
};

// Service Card Component
const ServiceCard = ({ icon: Icon, title, description, iconBg }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
    <div
      className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-8`}
    >
      <Icon className="text-3xl" />
    </div>
    <h3 className="font-extrabold text-xl mb-4">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed font-light">
      {description}
    </p>
  </div>
);

ServiceCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconBg: PropTypes.string.isRequired,
};

const Home = () => {
  const [activeFilter, setActiveFilter] = useState("All Vehicles");
  const [driveMode, setDriveMode] = useState("self");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 overflow-x-hidden">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-400/40">
                <MdElectricCar className="text-[22px]" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                EV Rental System
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/booking"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200"
              >
                <MdCalendarToday className="text-lg" />
                Đặt xe
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200"
              >
                <MdHistory className="text-lg" />
                Lịch sử
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                /* User Menu - Logged In */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 hover:bg-gray-100 rounded-full py-1.5 pl-1.5 pr-4 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || <MdPerson />}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user.username || "User"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <MdPerson className="text-lg" />
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/booking"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <MdCalendarToday className="text-lg" />
                        Đặt xe
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <MdHistory className="text-lg" />
                        Lịch sử thuê xe
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <MdLogout className="text-lg" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Not Logged In */
                <>
                  <Link
                    to="/login"
                    className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
              <button className="md:hidden p-2">
                <MdMenu className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* AI Chat Button - Fixed */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-[220px] animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-500">
              <MdSmartToy className="text-lg" />
            </div>
            <div>
              <p className="text-xs font-medium leading-tight text-gray-800">
                Need help choosing the right EV?
              </p>
              <button className="text-sky-500 text-[10px] font-bold mt-1 uppercase tracking-wider hover:underline">
                Chat with AI
              </button>
            </div>
          </div>
        </div>
        <button className="ai-float w-14 h-14 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-sky-600 transition-colors relative">
          <MdAutoAwesome className="text-2xl" />
        </button>
      </div>

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen w-full flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Hero EV"
            className="w-full h-full object-cover"
            src={heroBackground}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-80px)]">
            {/* Left - Text Content */}
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

            {/* Right - Booking Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 max-w-md lg:max-w-lg ml-auto w-full">
              {/* Drive Mode Toggle */}
              <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                <button
                  onClick={() => setDriveMode("self")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                    driveMode === "self"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tự Lái
                </button>
                <button
                  onClick={() => setDriveMode("driver")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                    driveMode === "driver"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Có Tài Xế
                </button>
              </div>

              <div className="space-y-5">
                {/* Pickup Location */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Điểm Đón
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 group focus-within:border-sky-500 focus-within:bg-white transition-all">
                    <MdLocationOn className="text-gray-400 text-xl group-focus-within:text-sky-500" />
                    <input
                      className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium placeholder:text-gray-400 outline-none"
                      placeholder="Nhập sân bay hoặc địa điểm"
                      type="text"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Ngày Nhận
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <MdCalendarToday className="text-gray-400 text-sm" />
                      <input
                        className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium outline-none"
                        type="date"
                        defaultValue="2026-02-20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Ngày Trả
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <MdCalendarToday className="text-gray-400 text-sm" />
                      <input
                        className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium outline-none"
                        type="date"
                        defaultValue="2026-02-24"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors">
                  Kiểm Tra Xe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section - Full Width */}
      <section className="py-20 lg:py-28 bg-white w-full" id="fleet">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight italic mb-3">
                Đội Xe Cao Cấp
              </h2>
              <p className="text-gray-500 text-base lg:text-lg">
                Xe điện hiệu suất cao, tuyển chọn dành cho khách hàng thượng lưu.
              </p>
            </div>
            {/* Filter Tabs */}
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

          {/* Car Grid - 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {carsData.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-14 text-center">
            <Link
              to="/cars"
              className="inline-block px-8 py-3.5 border border-gray-200 rounded-full font-medium text-sm hover:border-gray-400 transition-colors"
            >
              Xem Toàn Bộ ({carsData.length * 4} xe)
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
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

      {/* CTA Section */}
      <section className="py-20 lg:py-28 w-full">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-gray-900 text-white py-20 lg:py-32 px-8 lg:px-16 text-center">
            {/* Background Pattern */}
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
                Tham gia cộng đồng xe điện cao cấp và tận hưởng trải nghiệm di chuyển mới.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/cars"
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 w-full">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-400/40">
                  <MdElectricCar className="text-[22px]" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                  EV Rental System
                </span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Hệ thống cho thuê xe điện cao cấp. Cùng chúng tôi xây dựng một
                thế giới xanh hơn.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm">in</span>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm">📷</span>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">
                Trải Nghiệm
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Tự Lái Du Lịch
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Dịch Vụ Tài Xế
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Đội Xe Doanh Nghiệp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Thành Viên VIP
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">
                Tài Nguyên
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Triết Lý Của Chúng Tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Báo Cáo Môi Trường
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Mạng Lưới Sạc
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Tin Tức Báo Chí
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">
                Hỗ Trợ
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Tư Vấn 24/7
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Điều Khoản Thuê Xe
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Chính Sách Bảo Mật
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Trung Tâm Liên Hệ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs">
              © 2026 EV Rental System · Hệ Thống Hoạt Động Ổn Định
            </p>
            <div className="flex gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">
                Điều khoản
              </a>
              <a href="#" className="hover:text-gray-600 transition-colors">
                Chính sách
              </a>
              <a href="#" className="hover:text-gray-600 transition-colors">
                Liên hệ
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .car-card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .car-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
        }
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .ai-float {
          animation: subtle-float 4s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;
