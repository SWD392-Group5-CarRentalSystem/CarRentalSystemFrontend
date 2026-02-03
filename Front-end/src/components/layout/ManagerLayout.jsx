import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, Calendar, Users, LogOut } from "lucide-react";

export default function ManagerLayout() {
  const [breadcrumb, setBreadcrumb] = useState({ title: "Dashboard" });
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", to: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Cars", to: "/manager/cars", icon: Car },
    { label: "Bookings", to: "/manager/bookings", icon: Calendar },
    { label: "Drivers", to: "/manager/drivers", icon: Users },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-72 bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 text-white shrink-0 shadow-2xl">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            🚗 EV Rental
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manager Dashboard</p>
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
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{breadcrumb.title}</h2>
            <p className="text-sm text-gray-500">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              A
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
