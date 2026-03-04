import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context";
import {
  MdCalendarToday,
  MdElectricCar,
  MdMenu,
  MdLogout,
  MdPerson,
  MdHistory,
  MdClose,
  MdDashboard,
  MdWork,
} from "react-icons/md";

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isAuthenticated, logout, isManager, isStaffOrAbove } = useAuthContext();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#090C0C] backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-400/40">
              <MdElectricCar className="text-[22px]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              EV Rental System
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              to="/vehicles"
              className="group relative px-1 py-2 text-base font-semibold text-white/90 hover:text-white transition-all duration-300 tracking-wide"
            >
              <span className="relative z-10">Xe của chúng tôi</span>
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-emerald-400 to-green-500 group-hover:w-full transition-all duration-300 ease-out rounded-full"></span>
              {/* Glow effect */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-emerald-400 to-green-500 blur-sm group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              to="/booking"
              className="group relative px-1 py-2 text-base font-semibold text-white/90 hover:text-white transition-all duration-300 tracking-wide"
            >
              <span className="relative z-10">Đặt xe</span>
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-sky-400 to-blue-500 group-hover:w-full transition-all duration-300 ease-out rounded-full"></span>
              {/* Glow effect */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-sky-400 to-blue-500 blur-sm group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              to="/history"
              className="group relative px-1 py-2 text-base font-semibold text-white/90 hover:text-white transition-all duration-300 tracking-wide"
            >
              <span className="relative z-10">Lịch sử</span>
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-purple-400 to-pink-500 group-hover:w-full transition-all duration-300 ease-out rounded-full"></span>
              {/* Glow effect */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-purple-400 to-pink-500 blur-sm group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            
            {/* Manager Navigation */}
            {isManager() && (
              <Link
                to="/manager/dashboard"
                className="group relative px-1 py-2 text-base font-semibold text-white/90 hover:text-white transition-all duration-300 tracking-wide"
              >
                <span className="relative z-10">Quản trị</span>
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-red-400 to-pink-500 group-hover:w-full transition-all duration-300 ease-out rounded-full"></span>
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-red-400 to-pink-500 blur-sm group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            )}
            
            {/* Staff Navigation */}
            {isStaffOrAbove() && !isManager() && (
              <Link
                to="/staff/dashboard"
                className="group relative px-1 py-2 text-base font-semibold text-white/90 hover:text-white transition-all duration-300 tracking-wide"
              >
                <span className="relative z-10">Nhân viên</span>
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full transition-all duration-300 ease-out rounded-full"></span>
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-indigo-400 to-purple-500 blur-sm group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            )}
            
            <Link
              to="/about"
              className="group relative px-1 py-2 text-base font-semibold text-white/90 hover:text-white transition-all duration-300 tracking-wide"
            >
              <span className="relative z-10">Giới thiệu</span>
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-orange-400 to-red-500 group-hover:w-full transition-all duration-300 ease-out rounded-full"></span>
              {/* Glow effect */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-orange-400 to-red-500 blur-sm group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              /* User Menu - Logged In */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/20">
                    {user.username?.charAt(0).toUpperCase() || <MdPerson />}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-[#0f1214] rounded-xl shadow-2xl border border-white/10 py-2 animate-fade-in backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <p className="text-xs text-sky-400 font-medium capitalize">
                        {user.role === "manager" && "Quản lý"}
                        {user.role === "staff" && "Nhân viên"}
                        {user.role === "driver" && "Tài xế"}
                        {user.role === "customer" && "Khách hàng"}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <MdPerson className="text-lg text-sky-400" />
                        Hồ sơ cá nhân
                      </Link>
                      
                      {/* Role-based menu items */}
                      {isManager() && (
                        <Link
                          to="/manager/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <MdDashboard className="text-lg text-red-400" />
                          Bảng điều khiển
                        </Link>
                      )}
                      
                      {isStaffOrAbove() && !isManager() && (
                        <Link
                          to="/staff/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <MdWork className="text-lg text-purple-400" />
                          Khu vực nhân viên
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
                >
                  Đăng ký
                </Link>
              </div>
            )}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <MdClose className="text-2xl" />
              ) : (
                <MdMenu className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <nav className="flex flex-col gap-1">
              <Link
                to="/booking"
                className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/90 hover:bg-gradient-to-r hover:from-sky-500/20 hover:to-blue-500/20 transition-all duration-300"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 group-hover:scale-150 transition-transform duration-300"></span>
                Đặt xe
              </Link>
              <Link
                to="/history"
                className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/90 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-150 transition-transform duration-300"></span>
                Lịch sử
              </Link>
              <Link
                to="/about"
                className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/90 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:scale-150 transition-transform duration-300"></span>
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/90 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-300"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-150 transition-transform duration-300"></span>
                Liên hệ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
