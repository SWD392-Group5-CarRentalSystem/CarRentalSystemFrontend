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
} from "react-icons/md";

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
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
          <nav className="hidden md:flex items-center gap-3">
            <Link
              to="/booking"
              className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:text-white overflow-hidden transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <MdCalendarToday className="text-lg relative z-10" />
              <span className="relative z-10">Đặt xe</span>
            </Link>
            <Link
              to="/history"
              className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:text-white overflow-hidden transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <MdHistory className="text-lg relative z-10" />
              <span className="relative z-10">Lịch sử</span>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              /* User Menu - Logged In */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-full py-2 pl-2 pr-4 transition-all duration-300 border border-transparent hover:border-sky-200 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.username?.charAt(0).toUpperCase() || <MdPerson />}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-900">
                      {user.username || "Người dùng"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.role === "manager" || user.role === "staff"
                        ? "Quản trị viên"
                        : "Khách hàng"}
                    </span>
                  </div>
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
            <button 
              className="md:hidden p-2"
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
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              <Link
                to="/booking"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <MdCalendarToday className="text-lg text-sky-500" />
                Đặt xe
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <MdHistory className="text-lg text-emerald-500" />
                Lịch sử
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
