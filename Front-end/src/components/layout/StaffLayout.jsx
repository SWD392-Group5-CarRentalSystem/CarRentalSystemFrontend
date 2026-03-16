import { useState } from "react";
import { Outlet, Link, useLocation, useOutletContext } from "react-router-dom";
import {
  MdDashboard,
  MdDirectionsCar,
  MdPeople,
  MdHistory,
  MdWork,
  MdMenu,
  MdClose,
  MdLogout,
  MdElectricCar,
  MdPerson,
} from "react-icons/md";
import { useAuthContext } from "../../context";

const StaffLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [breadcrumb, setBreadcrumb] = useState({ title: "Dashboard" });
  const location = useLocation();
  const { logout, user } = useAuthContext();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      path: "/staff/dashboard",
    },
    {
      id: "bookings",
      label: "Quản lý đặt xe",
      icon: MdHistory,
      path: "/staff/bookings",
    },
    {
      id: "cars",
      label: "Quản lý xe",
      icon: MdDirectionsCar,
      path: "/staff/cars",
    },
    {
      id: "customers",
      label: "Khách hàng",
      icon: MdPeople,
      path: "/staff/customers",
    },
    {
      id: "profile",
      label: "Hồ sơ",
      icon: MdPerson,
      path: "/staff/profile",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <MdElectricCar className="text-lg" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-lg text-gray-900">
                Staff Portal
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="text-lg" />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">Nhân viên</p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <MdLogout className="text-base" />
              Đăng xuất
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <MdClose className="text-xl" />
              ) : (
                <MdMenu className="text-xl" />
              )}
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {breadcrumb.title}
              </h1>
              <p className="text-sm text-gray-500">
                Chào mừng trở lại, {user?.username}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet context={{ setBreadcrumb }} />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;