import { useEffect, useState, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  MdCalendarToday, MdCheckCircle, MdCancel, MdPending,
  MdDirectionsCar, MdAttachMoney, MdTrendingUp, MdStar,
  MdArrowUpward, MdArrowForward, MdSchedule, MdLocalAtm,
} from "react-icons/md";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { bookingService } from "../../services/api";
import { useAuthContext } from "../../context";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTHS_VI = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];

const fmtCurrency = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}K`
    : `${n}`;

const fmtFull = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// Build last-N-months stat series from bookings
const buildMonthSeries = (bookings, months = 6) => {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const mo = d.getMonth();
    const yr = d.getFullYear();
    const slice = bookings.filter((b) => {
      const sd = b.startDate ? new Date(b.startDate) : null;
      return sd && sd.getMonth() === mo && sd.getFullYear() === yr;
    });
    const income = slice
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
    return { name: MONTHS_VI[mo], trips: slice.length, income };
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
const StatCard = ({ icon: Icon, label, value, sub, grad, iconBg }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
    <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${grad}`} />
    <div className="p-5 flex items-start gap-4 pt-6">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
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

// ─── Donut chart for driver status ───────────────────────────────────────────
const DONUT_COLORS = ["#f59e0b", "#10b981", "#ef4444", "#6366f1"];
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DriverDashboard() {
  const { setBreadcrumb } = useOutletContext();
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setBreadcrumb({ title: "Dashboard" });
    (async () => {
      try {
        const res = await bookingService.getBookingsByDriver(user?._id);
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBookings(raw);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending   = bookings.filter((b) => !b.driverStatus || b.driverStatus === "pending_driver").length;
    const accepted  = bookings.filter((b) => b.driverStatus === "accepted").length;
    const rejected  = bookings.filter((b) => b.driverStatus === "rejected").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const totalIncome = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
    const rate = bookings.length ? ((completed / bookings.length) * 100).toFixed(0) : 0;
    return { pending, accepted, rejected, completed, total: bookings.length, totalIncome, rate };
  }, [bookings]);

  const monthSeries = useMemo(() => buildMonthSeries(bookings, 6), [bookings]);

  const donutData = [
    { name: "Chờ phản hồi",  value: stats.pending },
    { name: "Đã nhận",       value: stats.accepted },
    { name: "Đã từ chối",    value: stats.rejected },
    { name: "Hoàn thành",    value: stats.completed },
  ].filter((d) => d.value > 0);

  // ── Current month stats ─────────────────────────────────────────────────────
  const curMonth = monthSeries[monthSeries.length - 1] ?? { trips: 0, income: 0 };
  const prevMonth = monthSeries[monthSeries.length - 2] ?? { trips: 0, income: 0 };
  const tripDelta = curMonth.trips - prevMonth.trips;

  const today = new Date();
  const dateStr = today.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Hero banner ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-500 via-teal-500 to-green-600 p-7 shadow-xl text-white">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse shadow-lg shadow-emerald-300/60" />
              <span className="text-emerald-200 text-xs font-semibold uppercase tracking-widest">Đang hoạt động</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Xin chào, {user?.username} 👋</h1>
            <p className="text-emerald-100 text-sm mt-1">{dateStr}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/20">
              <p className="text-2xl font-black">{curMonth.trips}</p>
              <p className="text-[11px] text-emerald-200 mt-0.5">Chuyến tháng này</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/20">
              <p className="text-2xl font-black">{stats.rate}%</p>
              <p className="text-[11px] text-emerald-200 mt-0.5">Tỷ lệ hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Quick CTAs */}
        <div className="relative flex flex-wrap gap-2 mt-5">
          <Link to="/driver/schedule"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-700 rounded-xl text-sm font-bold shadow hover:shadow-md transition-all hover:-translate-y-px">
            <MdSchedule /> Xem lịch phân công
          </Link>
          {stats.pending > 0 && (
            <Link to="/driver/schedule"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-amber-900 rounded-xl text-sm font-bold shadow hover:-translate-y-px transition-all">
              <MdPending /> {stats.pending} chờ phản hồi
            </Link>
          )}
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={MdDirectionsCar}  label="Tổng lịch được giao" value={stats.total}
          sub="Tất cả thời gian" grad="from-emerald-400 to-teal-500" iconBg="bg-linear-to-br from-emerald-400 to-teal-500" />
        <StatCard icon={MdCheckCircle}    label="Hoàn thành" value={stats.completed}
          sub={`${stats.rate}% tỷ lệ`} grad="from-green-400 to-emerald-500" iconBg="bg-linear-to-br from-green-400 to-emerald-500" />
        <StatCard icon={MdPending}        label="Chờ phản hồi" value={stats.pending}
          sub="Cần xử lý" grad="from-amber-400 to-orange-400" iconBg="bg-linear-to-br from-amber-400 to-orange-400" />
        <StatCard icon={MdLocalAtm}       label="Giá trị hoàn thành" value={fmtCurrency(stats.totalIncome)}
          sub={fmtFull(stats.totalIncome)} grad="from-violet-500 to-indigo-500" iconBg="bg-linear-to-br from-violet-500 to-indigo-500" />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Activity area chart — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Tần suất hoạt động</h2>
              <p className="text-xs text-gray-400 mt-0.5">Số chuyến xe theo 6 tháng gần nhất</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${tripDelta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              <MdArrowUpward className={`text-sm ${tripDelta < 0 ? "rotate-180" : ""}`} />
              {Math.abs(tripDelta)} so với tháng trước
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthSeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTrips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip type="trips" />} />
              <Area type="monotone" dataKey="trips" name="Số chuyến" stroke="#10b981" strokeWidth={2.5}
                fill="url(#gradTrips)" dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — 1/3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-1">Phân bổ trạng thái</h2>
          <p className="text-xs text-gray-400 mb-3">Tỷ lệ phản hồi chuyến</p>
          {donutData.length === 0 ? (
            <div className="flex items-center justify-center h-45 text-gray-300 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={76}
                    dataKey="value" labelLine={false} label={renderCustomLabel} paddingAngle={3}>
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

      {/* ── Income bar chart ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Giá trị chuyến theo tháng</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tổng giá trị các chuyến đã hoàn thành (6 tháng qua)</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <MdTrendingUp className="text-emerald-500" />
            <span className="text-xs text-gray-400">đv: VNĐ</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthSeries} margin={{ top: 5, right: 5, left: 10, bottom: 0 }} barSize={32}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => fmtCurrency(v)} />
            <Tooltip content={<CustomTooltip type="income" />} />
            <Bar dataKey="income" name="Giá trị" fill="url(#gradIncome)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom metrics row ──────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Acceptance rate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tỷ lệ nhận chuyến</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-black text-emerald-600">
              {stats.total ? ((stats.accepted / stats.total) * 100).toFixed(0) : 0}%
            </span>
            <MdCheckCircle className="text-emerald-400 text-2xl mb-1" />
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-linear-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${stats.total ? (stats.accepted / stats.total) * 100 : 0}%` }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">{stats.accepted} / {stats.total} chuyến được nhận</p>
        </div>

        {/* Completion rate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tỷ lệ hoàn thành</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-black text-violet-600">{stats.rate}%</span>
            <MdStar className="text-violet-400 text-2xl mb-1" />
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-linear-to-r from-violet-400 to-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${stats.rate}%` }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">{stats.completed} / {stats.total} chuyến hoàn thành</p>
        </div>

        {/* Reminder banner */}
        <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-5 text-white flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">Hành động nhanh</p>
            <p className="font-bold text-lg leading-snug">
              {stats.pending > 0
                ? `Bạn có ${stats.pending} lịch đang chờ phản hồi`
                : "Không có lịch chờ phản hồi"}
            </p>
          </div>
          <Link to="/driver/schedule"
            className="mt-4 inline-flex items-center gap-1.5 self-start px-4 py-2 bg-white text-emerald-700 rounded-xl text-sm font-bold shadow hover:-translate-y-px transition-all">
            Xem lịch <MdArrowForward />
          </Link>
        </div>
      </div>

    </div>
  );
}
