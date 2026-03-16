import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  MdDirectionsCar, MdPeople, MdHistory, MdTrendingUp,
  MdCheckCircle, MdPending, MdArrowUpward, MdArrowForward,
  MdAttachMoney, MdCalendarToday, MdLocalAtm, MdStar,
} from "react-icons/md";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { bookingService, vehicleService } from "../../services/api";
import { useAuthContext } from "../../context";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTHS_VI = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];

const fmtCurrency = (n) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(0)}K`
  : `${n}`;

const fmtFull = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

const ACTIVE_STATUSES = ["confirmed", "vehicle_delivered", "in_progress", "vehicle_returned"];

const buildMonthSeries = (bookings, months = 6) => {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const mo  = d.getMonth();
    const yr  = d.getFullYear();
    const slice = bookings.filter((b) => {
      const sd = b.startDate ? new Date(b.startDate) : null;
      return sd && sd.getMonth() === mo && sd.getFullYear() === yr;
    });
    const income = slice
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
    return { name: MONTHS_VI[mo], bookings: slice.length, income };
  });
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, type }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-900">
            {type === "income" ? fmtFull(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, grad }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
    <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${grad}`} />
    <div className="p-5 flex items-start gap-4 pt-6">
      <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${grad} flex items-center justify-center shrink-0 shadow-md`}>
        <Icon className="text-2xl text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  </div>
);

// ─── Donut palette + label ────────────────────────────────────────────────────
const DONUT_COLORS = ["#f59e0b", "#6366f1", "#10b981", "#ef4444", "#06b6d4", "#8b5cf6"];
const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_VI = {
  pending:           { label: "Chờ duyệt",   color: "bg-amber-100 text-amber-700" },
  confirmed:         { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  vehicle_delivered: { label: "Đã giao xe",  color: "bg-indigo-100 text-indigo-700" },
  in_progress:       { label: "Đang thuê",   color: "bg-cyan-100 text-cyan-700" },
  vehicle_returned:  { label: "Đã trả xe",   color: "bg-purple-100 text-purple-700" },
  completed:         { label: "Hoàn thành",  color: "bg-emerald-100 text-emerald-700" },
  cancelled:         { label: "Đã huỷ",      color: "bg-red-100 text-red-700" },
};
const sv = (s) => STATUS_VI[s] || { label: s, color: "bg-gray-100 text-gray-600" };

// ─── Main ─────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { setBreadcrumb }   = useOutletContext();
  const { user }            = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { setBreadcrumb({ title: "Dashboard" }); }, [setBreadcrumb]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, vRes] = await Promise.all([
        bookingService.getAllBookings(),
        vehicleService.getAllVehicles(),
      ]);
      const bList = Array.isArray(bRes?.data) ? bRes.data : Array.isArray(bRes) ? bRes : [];
      const vList = Array.isArray(vRes?.data) ? vRes.data : Array.isArray(vRes) ? vRes : [];
      setBookings(bList);
      setVehicles(vList);
    } catch (e) {
      console.error("Staff dashboard error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active    = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pending   = bookings.filter((b) => b.status === "pending").length;
    const income    = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
    const customers = new Set(
      bookings.map((b) => b.customerId?._id ?? b.customerId).filter(Boolean)
    ).size;
    const availCars = vehicles.filter((v) => v.vehicleStatus === true).length;
    const rate = bookings.length ? ((completed / bookings.length) * 100).toFixed(0) : 0;
    return { total: bookings.length, active, completed, pending, income, customers, availCars, rate };
  }, [bookings, vehicles]);

  const monthSeries = useMemo(() => buildMonthSeries(bookings, 6), [bookings]);
  const curMonth    = monthSeries[monthSeries.length - 1] ?? { bookings: 0, income: 0 };
  const prevMonth   = monthSeries[monthSeries.length - 2] ?? { bookings: 0, income: 0 };
  const bookingDelta = curMonth.bookings - prevMonth.bookings;

  const donutData = [
    { name: "Chờ duyệt",   value: stats.pending },
    { name: "Đang thuê",   value: stats.active },
    { name: "Hoàn thành",  value: stats.completed },
    { name: "Đã huỷ",      value: bookings.filter(b => b.status === "cancelled").length },
  ].filter((d) => d.value > 0);

  // Latest 5 bookings
  const recentBookings = useMemo(() =>
    [...bookings]
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
      .slice(0, 5),
    [bookings]
  );

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-500 via-blue-600 to-cyan-600 p-7 shadow-xl text-white">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-pulse shadow-lg shadow-cyan-300/60" />
              <span className="text-cyan-200 text-xs font-semibold uppercase tracking-widest">Đang trực</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Xin chào, {user?.username} 👋</h1>
            <p className="text-indigo-200 text-sm mt-1">{today}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/20">
              <p className="text-2xl font-black">{curMonth.bookings}</p>
              <p className="text-[11px] text-indigo-200 mt-0.5">Đơn tháng này</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/20">
              <p className="text-2xl font-black">{stats.rate}%</p>
              <p className="text-[11px] text-indigo-200 mt-0.5">Hoàn thành</p>
            </div>
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2 mt-5">
          <Link to="/staff/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-bold shadow hover:-translate-y-px transition-all">
            <MdHistory /> Xem đặt xe
          </Link>
          {stats.pending > 0 && (
            <Link to="/staff/bookings"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-amber-900 rounded-xl text-sm font-bold shadow hover:-translate-y-px transition-all">
              <MdPending /> {stats.pending} chờ duyệt
            </Link>
          )}
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={MdHistory}      label="Tổng đơn đặt xe"  value={stats.total}     sub="Tất cả thời gian"          grad="from-indigo-400 to-blue-500" />
        <StatCard icon={MdTrendingUp}   label="Đang hoạt động"   value={stats.active}    sub={`${stats.pending} chờ duyệt`} grad="from-blue-400 to-cyan-500" />
        <StatCard icon={MdPeople}       label="Khách hàng"        value={stats.customers} sub="Từ dữ liệu đặt xe"          grad="from-violet-400 to-purple-500" />
        <StatCard icon={MdLocalAtm}     label="Doanh thu"         value={fmtCurrency(stats.income)} sub={fmtFull(stats.income)} grad="from-emerald-400 to-teal-500" />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Booking activity area chart — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Tần suất đặt xe</h2>
              <p className="text-xs text-gray-400 mt-0.5">Số đơn theo 6 tháng gần nhất</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${bookingDelta >= 0 ? "bg-indigo-50 text-indigo-600" : "bg-red-50 text-red-600"}`}>
              <MdArrowUpward className={`text-sm ${bookingDelta < 0 ? "rotate-180" : ""}`} />
              {Math.abs(bookingDelta)} so với tháng trước
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthSeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="staffGradBooking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip type="bookings" />} />
              <Area type="monotone" dataKey="bookings" name="Số đơn" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#staffGradBooking)"
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — 1/3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-1">Phân bổ trạng thái</h2>
          <p className="text-xs text-gray-400 mb-3">Tỷ lệ theo từng trạng thái đơn</p>
          {donutData.length === 0 ? (
            <div className="flex items-center justify-center h-45 text-gray-300 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={76}
                    dataKey="value" labelLine={false} label={renderLabel} paddingAngle={3}>
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    <span className="text-gray-500 truncate">{d.name}</span>
                    <span className="ml-auto font-bold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Revenue bar chart ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Doanh thu theo tháng</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tổng giá trị đơn hoàn thành (6 tháng gần nhất)</p>
          </div>
          <span className="text-xs text-gray-400">đv: VNĐ</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthSeries} margin={{ top: 5, right: 5, left: 10, bottom: 0 }} barSize={32}>
            <defs>
              <linearGradient id="staffGradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => fmtCurrency(v)} />
            <Tooltip content={<CustomTooltip type="income" />} />
            <Bar dataKey="income" name="Doanh thu" fill="url(#staffGradIncome)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom row ───────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent bookings table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Đơn đặt xe gần đây</h2>
            <Link to="/staff/bookings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Xem tất cả <MdArrowForward />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <MdHistory className="text-4xl mx-auto mb-2" />
              <p className="text-sm">Chưa có đơn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBookings.map((b) => {
                const status = sv(b.status);
                return (
                  <div key={b._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                    <div className="w-9 h-9 bg-linear-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
                      {(b.customerId?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {b.customerId?.username || "Khách hàng"}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {b.vehicleId?.vehicleName || "—"} · {fmtDate(b.startDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${status.color}`}>
                        {status.label}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {b.totalAmount ? fmtFull(parseFloat(b.totalAmount)) : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right mini-cards */}
        <div className="flex flex-col gap-4">
          {/* Completion rate */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tỷ lệ hoàn thành</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-indigo-600">{stats.rate}%</span>
              <MdStar className="text-indigo-300 text-2xl mb-1" />
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-linear-to-r from-indigo-400 to-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.rate}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">{stats.completed} / {stats.total} đơn hoàn thành</p>
          </div>

          {/* Vehicle availability */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Xe sẵn sàng</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-emerald-600">{stats.availCars}</span>
              <MdDirectionsCar className="text-emerald-300 text-2xl mb-1" />
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-linear-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all"
                style={{ width: vehicles.length ? `${(stats.availCars / vehicles.length) * 100}%` : "0%" }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">{stats.availCars} / {vehicles.length} xe</p>
          </div>

          {/* Quick action banner */}
          <div className="bg-linear-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-sm p-5 text-white flex flex-col justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Hành động nhanh</p>
              <p className="font-bold text-base leading-snug">
                {stats.pending > 0
                  ? `${stats.pending} đơn đang chờ xét duyệt`
                  : "Không có đơn chờ duyệt"}
              </p>
            </div>
            <Link to="/staff/bookings"
              className="mt-4 inline-flex items-center gap-1.5 self-start px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-bold shadow hover:-translate-y-px transition-all">
              Xử lý ngay <MdArrowForward />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;