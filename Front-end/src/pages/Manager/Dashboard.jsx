import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  RefreshCw, Car, Users, Wallet, Activity, TrendingUp, CheckCircle,
  ArrowRight, UserCheck, Building2, List, Clock, BarChart2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { vehicleService, bookingService, reportService } from "../../services/api";
import { staffService } from "../../services/api/staffService";
import { useAuthContext } from "../../context";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS_VI = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];
const ACTIVE_STATUSES = ["confirmed","vehicle_delivered","in_progress","vehicle_returned","transporting"];

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(n) || 0);
const fmtShort = (n) =>
  n >= 1_000_000_000 ? `${(n / 1_000_000_000).toFixed(1)}T`
  : n >= 1_000_000   ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000       ? `${(n / 1_000).toFixed(0)}K`
  : `${n}`;


const buildMonthSeries = (bookings, months = 6) => {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d  = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const mo = d.getMonth(), yr = d.getFullYear();
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

const STATUS_CONFIG = {
  pending:                       { label: "Chờ xác nhận",  color: "bg-amber-100 text-amber-700" },
  awaiting_deposit_confirmation: { label: "Chờ duyệt cọc", color: "bg-orange-100 text-orange-700" },
  confirmed:                     { label: "Đã xác nhận",   color: "bg-sky-100 text-sky-700" },
  vehicle_delivered:             { label: "Đã giao xe",    color: "bg-blue-100 text-blue-700" },
  in_progress:                   { label: "Đang thuê",     color: "bg-emerald-100 text-emerald-700" },
  transporting:                  { label: "Đang chở",      color: "bg-violet-100 text-violet-700" },
  vehicle_returned:              { label: "Đã trả xe",     color: "bg-indigo-100 text-indigo-700" },
  completed:                     { label: "Hoàn thành",    color: "bg-teal-100 text-teal-700" },
  cancelled:                     { label: "Đã hủy",        color: "bg-red-100 text-red-700" },
  deposit_lost:                  { label: "Mất cọc",       color: "bg-red-100 text-red-800" },
};
const sv = (s) => STATUS_CONFIG[s] || { label: s, color: "bg-gray-100 text-gray-600" };

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
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
            {type === "income" ? fmtVND(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, grad }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
    <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${grad}`} />
    <div className="p-4 flex items-start gap-3 pt-5">
      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${grad} flex items-center justify-center shrink-0 shadow-md`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-xl font-black text-gray-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

// ─── Donut helpers ────────────────────────────────────────────────────────────
const DONUT_COLORS = ["#f59e0b", "#6366f1", "#10b981", "#ef4444", "#8b5cf6"];
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

export default function Dashboard() {
  const { setBreadcrumb } = useOutletContext();
  const { user }          = useAuthContext();
  const [bookings,    setBookings]    = useState([]);
  const [vehicles,    setVehicles]    = useState([]);
  const [staffCount,  setStaffCount]  = useState(0);
  const [loading,     setLoading]     = useState(true);

  // Financial report
  const todayStr    = () => new Date().toISOString().slice(0, 10);
  const firstOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };
  const [repFrom,    setRepFrom]    = useState(firstOfMonth());
  const [repTo,      setRepTo]      = useState(todayStr());
  const [repData,    setRepData]    = useState(null);
  const [repLoading, setRepLoading] = useState(false);
  const [repError,   setRepError]   = useState("");

  useEffect(() => { setBreadcrumb({ title: "Dashboard" }); }, [setBreadcrumb]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      vehicleService.getAllVehicles(),
      bookingService.getAllBookings(),
      staffService.getAllStaff(),
    ]);
    const [vRes, bRes, sRes] = results;
    if (vRes.status === "fulfilled") {
      const d = vRes.value;
      setVehicles(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
    }
    if (bRes.status === "fulfilled") {
      const d = bRes.value;
      setBookings(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
    }
    if (sRes.status === "fulfilled") {
      const d = sRes.value;
      const list = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
      setStaffCount(list.length);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-fetch report on mount
  useEffect(() => {
    (async () => {
      try {
        setRepLoading(true);
        const res = await reportService.getFinancialReport(firstOfMonth(), todayStr());
        setRepData(res?.data ?? res);
      } catch { /* silent */ } finally { setRepLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchReport = async () => {
    if (!repFrom || !repTo) return;
    setRepError("");
    setRepLoading(true);
    try {
      const res = await reportService.getFinancialReport(repFrom, repTo);
      setRepData(res?.data ?? res);
    } catch (err) {
      setRepError(err?.response?.data?.message ?? err?.message ?? "Lỗi khi tải báo cáo");
    } finally {
      setRepLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active    = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pending   = bookings.filter((b) =>
      ["pending", "awaiting_deposit_confirmation"].includes(b.status)).length;
    const cancelled = bookings.filter((b) =>
      ["cancelled", "deposit_lost"].includes(b.status)).length;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthIncome = bookings
      .filter((b) => b.status === "completed" && new Date(b.createdAt ?? 0) >= monthStart)
      .reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
    const totalIncome = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
    const customers  = new Set(bookings.map((b) => b.customerId?._id ?? b.customerId).filter(Boolean)).size;
    const availCars  = vehicles.filter((v) => v.vehicleStatus === true).length;
    const rate       = bookings.length ? ((completed / bookings.length) * 100).toFixed(0) : 0;
    return {
      total: bookings.length, active, completed, pending, cancelled,
      monthIncome, totalIncome, customers, availCars,
      totalVehicles: vehicles.length, staffCount, rate,
    };
  }, [bookings, vehicles, staffCount]);

  const monthSeries  = useMemo(() => buildMonthSeries(bookings, 6), [bookings]);
  const curMonth     = monthSeries[monthSeries.length - 1] ?? { bookings: 0, income: 0 };
  const prevMonth    = monthSeries[monthSeries.length - 2] ?? { bookings: 0, income: 0 };
  const bookingDelta = curMonth.bookings - prevMonth.bookings;

  const donutData = [
    { name: "Chờ xác nhận", value: stats.pending },
    { name: "Đang thuê",    value: stats.active },
    { name: "Hoàn thành",   value: stats.completed },
    { name: "Đã hủy",       value: stats.cancelled },
  ].filter((d) => d.value > 0);

  const recentBookings = useMemo(() =>
    [...bookings].sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)).slice(0, 5),
    [bookings]
  );

  const todayDisplay = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 p-7 shadow-xl text-white">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={14} className="text-blue-300" />
              <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Quản lý hệ thống</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Xin chào, {user?.username} 👋</h1>
            <p className="text-blue-200 text-sm mt-1">{todayDisplay}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/20">
              <p className="text-2xl font-black">{curMonth.bookings}</p>
              <p className="text-[11px] text-blue-200 mt-0.5">Đơn tháng này</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/20">
              <p className="text-2xl font-black">{stats.rate}%</p>
              <p className="text-[11px] text-blue-200 mt-0.5">Hoàn thành</p>
            </div>
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2 mt-5">
          <button onClick={fetchAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold shadow hover:-translate-y-px transition-all">
            <RefreshCw size={14} /> Làm mới
          </button>
          <Link to="/manager/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-bold border border-white/30 hover:-translate-y-px transition-all">
            <List size={14} /> Quản lý đơn
          </Link>
          {stats.pending > 0 && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-amber-900 rounded-xl text-sm font-bold shadow">
              <Clock size={14} /> {stats.pending} chờ xử lý
            </span>
          )}
        </div>
      </div>

      {/* ── Stat cards (6) ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Car}       label="Tổng xe"        value={stats.totalVehicles}          sub={`${stats.availCars} sẵn sàng`}    grad="from-blue-400 to-blue-600" />
        <StatCard icon={Activity}  label="Đang hoạt động" value={stats.active}                  sub="Đơn đang chạy"                     grad="from-emerald-400 to-teal-500" />
        <StatCard icon={List}      label="Tổng đơn"       value={stats.total}                   sub={`${stats.completed} hoàn thành`}   grad="from-indigo-400 to-violet-500" />
        <StatCard icon={Users}     label="Khách hàng"     value={stats.customers}               sub="Từ dữ liệu đặt xe"                grad="from-purple-400 to-pink-500" />
        <StatCard icon={UserCheck} label="Nhân viên"      value={stats.staffCount}              sub="Nhân viên hiện tại"               grad="from-cyan-400 to-sky-500" />
        <StatCard icon={Wallet}    label="D.thu tháng"    value={fmtShort(stats.monthIncome)}   sub={fmtVND(stats.monthIncome)}        grad="from-orange-400 to-amber-500" />
      </div>

      {/* ── Charts row: Area + Donut ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Booking frequency area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Tần suất đặt xe</h2>
              <p className="text-xs text-gray-400 mt-0.5">Số đơn 6 tháng gần nhất</p>
            </div>
            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${bookingDelta >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
              <TrendingUp size={12} />
              {bookingDelta >= 0 ? "+" : ""}{bookingDelta} so tháng trước
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthSeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mgrGradBooking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip type="bookings" />} />
              <Area type="monotone" dataKey="bookings" name="Số đơn" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#mgrGradBooking)"
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status donut */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-1">Phân bổ trạng thái</h2>
          <p className="text-xs text-gray-400 mb-3">Tỷ lệ đơn theo trạng thái</p>
          {donutData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Chưa có dữ liệu</div>
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
            <p className="text-xs text-gray-400 mt-0.5">Giá trị đơn hoàn thành 6 tháng gần nhất</p>
          </div>
          <span className="text-xs text-gray-400">đv: VNĐ</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthSeries} margin={{ top: 5, right: 5, left: 15, bottom: 0 }} barSize={32}>
            <defs>
              <linearGradient id="mgrGradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => fmtShort(v)} />
            <Tooltip content={<CustomTooltip type="income" />} />
            <Bar dataKey="income" name="Doanh thu" fill="url(#mgrGradIncome)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent bookings + Mini stats ────────────────────────────────────── */}

      {/* ── Financial Report ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Báo cáo tài chính</h2>
            <p className="text-xs text-gray-500">Thống kê doanh thu theo khoảng thời gian</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Date filter */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày</label>
              <input type="date" value={repFrom} onChange={(e) => setRepFrom(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Đến ngày</label>
              <input type="date" value={repTo} onChange={(e) => setRepTo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <button onClick={handleFetchReport} disabled={repLoading}
              className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-60">
              <RefreshCw size={14} className={repLoading ? "animate-spin" : ""} />
              {repLoading ? "Đang tải..." : "Xem báo cáo"}
            </button>
          </div>

          {repError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{repError}</p>
          )}

          {repLoading && !repData && (
            <div className="flex items-center justify-center h-24 text-gray-400 gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm">Đang tải báo cáo...</span>
            </div>
          )}

          {repData && (
            <>
              {/* Summary cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Tổng doanh thu</p>
                    <p className="text-xl font-black text-emerald-700">{fmtVND(repData.totalRevenue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Đơn hoàn thành</p>
                    <p className="text-xl font-black text-blue-700">{repData.completedBookings ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Top vehicles */}
              {Array.isArray(repData.topBookedVehicles) && repData.topBookedVehicles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Car size={16} className="text-blue-500" />
                    <h3 className="font-bold text-gray-800 text-sm">Top xe theo lượt thuê</h3>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {["#", "Tên xe", "Loại", "Lượt thuê", "Doanh thu"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {repData.topBookedVehicles.map((v, i) => (
                          <tr key={v.vehicleId ?? i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{v.vehicleName}</td>
                            <td className="px-4 py-3 text-gray-500 capitalize">{v.vehicleType}</td>
                            <td className="px-4 py-3 text-gray-900 font-medium">{v.bookingCount}</td>
                            <td className="px-4 py-3 text-emerald-600 font-bold">{fmtVND(v.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {!repData && !repLoading && (
            <div className="text-center py-8">
              <BarChart2 size={40} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Chọn khoảng thời gian và nhấn "Xem báo cáo"</p>
            </div>
          )}
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent bookings table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Đơn thuê gần đây</h2>
            <Link to="/manager/bookings"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <Activity size={36} className="mx-auto mb-2" />
              <p className="text-sm">Chưa có đơn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBookings.map((b) => {
                const status = sv(b.status);
                return (
                  <div key={b._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                    <div className="w-9 h-9 bg-linear-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
                      {(b.customerId?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {b.customerId?.username || "Khách hàng"}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {b.vehicleId?.vehicleName || "—"} · {b.startDate ? new Date(b.startDate).toLocaleDateString("vi-VN") : "—"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${status.color}`}>
                        {status.label}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {b.totalAmount ? fmtVND(parseFloat(b.totalAmount)) : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mini stat column */}
        <div className="flex flex-col gap-4">
          {/* Completion rate */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tỷ lệ hoàn thành</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-blue-600">{stats.rate}%</span>
              <CheckCircle size={22} className="text-blue-300 mb-1" />
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-linear-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.rate}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">{stats.completed} / {stats.total} đơn</p>
          </div>

          {/* Total income */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tổng doanh thu</p>
            <p className="text-2xl font-black text-emerald-600">{fmtShort(stats.totalIncome)}</p>
            <p className="text-[11px] text-gray-400 mt-1">{fmtVND(stats.totalIncome)}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp size={13} /> Từ {stats.completed} đơn hoàn thành
            </div>
          </div>

          {/* Vehicle availability */}
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm p-5 text-white flex-1">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Xe sẵn sàng</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black">{stats.availCars}</span>
              <span className="text-blue-200 text-sm mb-1">/ {stats.totalVehicles}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-3">
              <div className="bg-white h-2 rounded-full transition-all"
                style={{ width: stats.totalVehicles ? `${(stats.availCars / stats.totalVehicles) * 100}%` : "0%" }} />
            </div>
            <Link to="/manager/vehicles"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white transition-colors">
              Quản lý xe <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
