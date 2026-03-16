import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Car, Calendar, Users, UserCog, LogOut, User } from "lucide-react";
import { MdElectricCar } from "react-icons/md";
import { useAuthContext } from "../../context/AuthContext";

export default function ManagerLayout() {
  const [breadcrumb, setBreadcrumb] = useState({ title: "Tổng quan" });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const menuItems = [
    { label: "Tổng quan", to: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Quản lý xe", to: "/manager/vehicles", icon: Car },
    { label: "Đơn thuê", to: "/manager/bookings", icon: Calendar },
    { label: "Tài xế", to: "/manager/drivers", icon: Users },
    { label: "Nhân viên", to: "/manager/staff", icon: UserCog },
    { label: "Hồ sơ", to: "/manager/profile", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-72 bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 text-white shrink-0 shadow-2xl">
        <div className="px-6 py-6 border-b border-white/10">
          <Link to="/manager/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-400/40">
              <MdElectricCar className="text-[22px]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">EV Rental System</h1>
              <p className="text-[10px] text-gray-400 mt-0.5">Quản lý hệ thống</p>
            </div>
          </Link>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{breadcrumb.title}</h2>
            <p className="text-sm text-gray-500">Xin chào, {user?.username ?? "Manager"}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0)?.toUpperCase() ?? "M"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-linear-to-br from-gray-50 via-blue-50 to-cyan-50">
          <div className="mx-auto max-w-7xl p-8 h-full">
            <Outlet context={{ setBreadcrumb }} />
          </div>
        </main>
      </div>
    </div>
  );
}
