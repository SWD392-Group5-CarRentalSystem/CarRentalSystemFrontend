import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdCalendarToday,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdElectricCar,
} from "react-icons/md";
import { useAuthContext } from "../../context";

const DriverLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [breadcrumb, setBreadcrumb] = useState({ title: "Dashboard" });
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      path: "/driver/dashboard",
    },
    {
      id: "schedule",
      label: "Lịch phân công",
      icon: MdCalendarToday,
      path: "/driver/schedule",
    },
    {
      id: "profile",
      label: "Hồ sơ",
      icon: MdPerson,
      path: "/driver/profile",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm relative`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center z-10 text-gray-500 hover:text-indigo-600"
        >
          {isSidebarOpen ? <MdClose size={14} /> : <MdMenu size={14} />}
        </button>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow">
              <MdElectricCar className="text-lg" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-lg text-gray-900">
                Driver Portal
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
                        ? "bg-green-50 text-green-700 border-r-2 border-green-500"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="text-lg shrink-0" />
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
            <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user?.username?.charAt(0).toUpperCase() ?? "D"}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">Tài xế</p>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{breadcrumb.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.charAt(0)?.toUpperCase() ?? "D"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
              <p className="text-xs text-gray-500">Tài xế</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-linear-to-br from-gray-50 via-green-50 to-emerald-50">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet context={{ setBreadcrumb }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
