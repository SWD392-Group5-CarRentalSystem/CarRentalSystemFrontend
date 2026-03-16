import { useState, useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  MdPerson, MdEmail, MdPhone, MdCalendarToday, MdEdit, MdSave, MdClose,
  MdArrowBack, MdVerifiedUser, MdCheckCircle, MdWarning, MdShield,
  MdDashboard, MdDirectionsCar, MdBarChart, MdWork,
} from "react-icons/md";
import { useAuthContext } from "../../context";
import { profileService, bookingService } from "../../services/api";

// ─── Helpers ────────────────────────────────────────────────────────────────
const autoFormatDate = (raw) => {
  let d = raw.replace(/[^0-9]/g, "");
  if (d.length > 8) d = d.slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};
const toISO = (dmy) => { const p = (dmy || "").split("/"); return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : dmy; };
const fromISO = (iso) => { const p = (iso || "").split("-"); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso; };

// ─── Role config ─────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  manager: {
    label: "Quản lý",
    heroGrad: "from-violet-600 via-purple-600 to-indigo-700",
    avatarGrad: "from-violet-500 to-purple-700",
    accentBg: "bg-violet-50",
    accentText: "text-violet-600",
    accentBorder: "border-violet-200",
    badgeBg: "bg-violet-100 text-violet-700",
    securityGrad: "from-violet-500 to-indigo-700",
    editBtn: "bg-violet-500 hover:bg-violet-600 shadow-violet-400/30",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    quickActions: [
      { to: "/manager/dashboard", icon: MdDashboard,      label: "Dashboard",   desc: "Tổng quan hệ thống", color: "violet" },
      { to: "/manager/bookings",  icon: MdDirectionsCar,  label: "Đơn thuê xe", desc: "Quản lý và xét duyệt", color: "purple" },
      { to: "/manager/report",    icon: MdBarChart,       label: "Báo cáo",     desc: "Thống kê doanh thu",  color: "indigo" },
    ],
    backTo: "/manager/dashboard",
    breadcrumb: "Hồ sơ cá nhân",
  },
  staff: {
    label: "Nhân viên",
    heroGrad: "from-indigo-500 via-blue-600 to-cyan-600",
    avatarGrad: "from-indigo-500 to-blue-700",
    accentBg: "bg-indigo-50",
    accentText: "text-indigo-600",
    accentBorder: "border-indigo-200",
    badgeBg: "bg-indigo-100 text-indigo-700",
    securityGrad: "from-indigo-500 to-blue-700",
    editBtn: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-400/30",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    quickActions: [
      { to: "/staff/dashboard", icon: MdDashboard,     label: "Dashboard",      desc: "Tổng quan nhân viên",   color: "indigo" },
      { to: "/staff/bookings",  icon: MdDirectionsCar, label: "Quản lý đặt xe", desc: "Xem & xử lý đơn thuê", color: "blue" },
    ],
    backTo: "/staff/dashboard",
    breadcrumb: "Hồ sơ cá nhân",
  },
  driver: {
    label: "Tài xế",
    heroGrad: "from-emerald-500 via-teal-500 to-green-600",
    avatarGrad: "from-green-500 to-emerald-700",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-600",
    accentBorder: "border-emerald-200",
    badgeBg: "bg-emerald-100 text-emerald-700",
    securityGrad: "from-green-500 to-emerald-700",
    editBtn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-400/30",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    quickActions: [
      { to: "/driver/dashboard", icon: MdDashboard,     label: "Dashboard",       desc: "Tổng quan tài xế",  color: "emerald" },
      { to: "/driver/schedule",  icon: MdWork,          label: "Lịch phân công",  desc: "Xem lịch chạy xe",  color: "green" },
    ],
    backTo: "/driver/dashboard",
    breadcrumb: "Hồ sơ cá nhân",
  },
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ icon: Icon, label, name, value, type, isEditing, onChange, placeholder, maxLength, accentClass }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all duration-200 ${
      isEditing ? `bg-white ${accentClass} ring-2 ring-offset-0` : "bg-gray-50 border-gray-200"
    }`}>
      <Icon className={`text-lg shrink-0 ${isEditing ? "text-current" : "text-gray-400"}`} />
      {isEditing ? (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder || label}
          maxLength={maxLength}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 placeholder:text-gray-300"
        />
      ) : (
        <span className="flex-1 text-sm font-medium text-gray-900">
          {value || <span className="text-gray-300">Chưa cập nhật</span>}
        </span>
      )}
    </div>
  </div>
);

// ─── StatChip ────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, bg }) => (
  <div className={`flex flex-col items-center justify-center px-4 py-4 rounded-2xl ${bg}`}>
    <span className="text-2xl font-black text-gray-900">{value}</span>
    <span className="text-[11px] font-semibold text-gray-500 mt-0.5 text-center leading-tight">{label}</span>
  </div>
);

// ─── QuickActionLink ─────────────────────────────────────────────────────────
const QuickActionLink = ({ to, icon: Icon, label, desc, color }) => (
  <Link to={to}
    className={`group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-${color}-50 hover:border-${color}-100 transition-all duration-200`}
  >
    <div className={`w-10 h-10 bg-${color}-50 group-hover:bg-${color}-500 rounded-xl flex items-center justify-center transition-colors duration-200 shrink-0`}>
      <Icon className={`text-lg text-${color}-500 group-hover:text-white transition-colors duration-200`} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
      <p className="text-xs text-gray-400 truncate">{desc}</p>
    </div>
  </Link>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const InternalProfile = ({ role }) => {
  const { user } = useAuthContext();
  const { setBreadcrumb } = useOutletContext();
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.staff;

  const [isEditing, setIsEditing]   = useState(false);
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [stats, setStats]           = useState({ total: 0, active: 0, completed: 0, extra: 0 });

  const emptyForm = { username: "", email: "", phoneNumber: "", DOB: "" };
  const [formData, setFormData]     = useState(emptyForm);
  const originalData                = useRef(emptyForm);

  useEffect(() => { setBreadcrumb?.({ title: cfg.breadcrumb }); }, [setBreadcrumb, cfg.breadcrumb]);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);

    const loadProfile = profileService.getProfile(user).then((res) => {
      const profile = {
        username:    res?.username    || user.username || "",
        email:       res?.email       || "",
        phoneNumber: res?.phoneNumber || "",
        DOB:         res?.DOB ? fromISO(res.DOB.split("T")[0]) : "",
      };
      setFormData(profile);
      originalData.current = profile;
    }).catch(() => {
      const profile = { username: user.username || "", email: "", phoneNumber: "", DOB: "" };
      setFormData(profile);
      originalData.current = profile;
    });

    // Load stats depending on role
    let loadStats = Promise.resolve();
    if (role === "manager" || role === "staff") {
      loadStats = bookingService.getAllBookings().then((res) => {
        const list = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : [];
        setStats({
          total:     list.length,
          active:    list.filter((b) => ["confirmed","vehicle_delivered","in_progress"].includes(b.status)).length,
          completed: list.filter((b) => b.status === "completed").length,
          extra:     list.filter((b) => b.status === "pending").length,
        });
      }).catch(() => {});
    } else if (role === "driver" && user?._id) {
      loadStats = bookingService.getBookingsByDriver(user._id).then((res) => {
        const list = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : [];
        setStats({
          total:     list.length,
          active:    list.filter((b) => b.status === "transporting").length,
          completed: list.filter((b) => b.status === "completed").length,
          extra:     list.filter((b) => b.status === "confirmed").length,
        });
      }).catch(() => {});
    }

    Promise.all([loadProfile, loadStats]).finally(() => setIsLoading(false));
  }, [user, role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDOBChange = (e) =>
    setFormData((prev) => ({ ...prev, DOB: autoFormatDate(e.target.value) }));

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await profileService.updateProfile(user, {
        username: formData.username, email: formData.email,
        phoneNumber: formData.phoneNumber, DOB: toISO(formData.DOB) || undefined,
      }, role);
      originalData.current = { ...formData };
      setIsEditing(false);
      setSaveMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: "error", text: err?.message || "Lưu thất bại, vui lòng thử lại." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...originalData.current });
    setIsEditing(false);
    setSaveMessage(null);
  };

  const avatarLetter = (formData.username || user?.username || "U").charAt(0).toUpperCase();
  const securityItems = [true, !!formData.email, !!formData.phoneNumber];
  const securityPct = Math.round((securityItems.filter(Boolean).length / 3) * 100);

  // Role-specific stat labels
  const statDefs = role === "manager" ? [
    { label: "Tổng đơn",   value: stats.total,     bg: "bg-violet-50" },
    { label: "Đang thuê",  value: stats.active,    bg: "bg-blue-50" },
    { label: "Hoàn thành", value: stats.completed, bg: "bg-emerald-50" },
    { label: "Chờ duyệt",  value: stats.extra,     bg: "bg-amber-50" },
  ] : role === "staff" ? [
    { label: "Tổng đơn",   value: stats.total,     bg: "bg-indigo-50" },
    { label: "Đang thuê",  value: stats.active,    bg: "bg-blue-50" },
    { label: "Hoàn thành", value: stats.completed, bg: "bg-emerald-50" },
    { label: "Chờ duyệt",  value: stats.extra,     bg: "bg-amber-50" },
  ] : [
    { label: "Tổng chuyến",   value: stats.total,     bg: "bg-emerald-50" },
    { label: "Đang chở",      value: stats.active,    bg: "bg-amber-50" },
    { label: "Hoàn thành",    value: stats.completed, bg: "bg-teal-50" },
    { label: "Sắp chở",      value: stats.extra,     bg: "bg-green-50" },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-current rounded-full animate-spin" style={{ borderTopColor: "var(--tw-gradient-from)" }} />
          <p className="text-gray-400 font-medium animate-pulse">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className={`relative rounded-3xl overflow-hidden bg-linear-to-br ${cfg.heroGrad} p-7 shadow-xl`}>
        {/* Blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-24 h-24 rounded-2xl bg-linear-to-br ${cfg.avatarGrad} ring-4 ring-white/30 flex items-center justify-center shadow-2xl`}>
              <span className="text-4xl font-black text-white select-none">{avatarLetter}</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{formData.username || "—"}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white`}>
                <MdVerifiedUser className="text-xs" /> Đã xác thực
              </span>
            </div>
            <p className="text-white/70 text-sm mb-5">{cfg.label} · EV Rental System</p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statDefs.map((s) => (
                <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-[11px] text-white/70 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            {saveMessage && (
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                saveMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {saveMessage.type === "success" ? <MdCheckCircle /> : <MdWarning />}
                {saveMessage.text}
              </div>
            )}
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={handleCancel} disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  <MdClose className="text-base" /> Hủy
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-900 hover:bg-white/90 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-60">
                  {isSaving
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <MdSave className="text-base" />}
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-px border border-white/30">
                <MdEdit className="text-base" /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Personal info form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className={`w-8 h-8 ${cfg.accentBg} rounded-lg flex items-center justify-center`}>
              <MdPerson className={`${cfg.accentText} text-lg`} />
            </div>
            <h2 className="font-bold text-gray-900">Thông tin cá nhân</h2>
            {isEditing && (
              <span className={`ml-auto text-xs ${cfg.accentText} ${cfg.accentBg} px-2.5 py-1 rounded-full font-semibold`}>
                Đang chỉnh sửa
              </span>
            )}
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-5">
            <Field icon={MdPerson}       label="Họ và tên"      name="username"    value={formData.username}    type="text"  isEditing={isEditing} onChange={handleInputChange} accentClass={`${cfg.accentBorder} ring-${cfg.accentBorder}`} />
            <Field icon={MdEmail}        label="Email"          name="email"       value={formData.email}       type="email" isEditing={isEditing} onChange={handleInputChange} accentClass={cfg.accentBorder} />
            <Field icon={MdPhone}        label="Số điện thoại"  name="phoneNumber" value={formData.phoneNumber} type="tel"   isEditing={isEditing} onChange={handleInputChange} accentClass={cfg.accentBorder} />
            <Field icon={MdCalendarToday} label="Ngày sinh"     name="DOB"         value={formData.DOB}         type="text"  isEditing={isEditing} onChange={handleDOBChange}  accentClass={cfg.accentBorder} placeholder="dd/mm/yyyy" maxLength={10} />
          </div>

          <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
            <MdShield className="text-gray-400 text-xl shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vai trò tài khoản</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{cfg.label} — tài khoản đã được xác minh</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <MdCheckCircle /> Hợp lệ
            </span>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">

          {/* Quick actions */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className={`w-8 h-8 ${cfg.accentBg} rounded-lg flex items-center justify-center`}>
                <MdDirectionsCar className={`${cfg.accentText} text-lg`} />
              </div>
              <h2 className="font-bold text-gray-900 text-sm">Thao tác nhanh</h2>
            </div>
            <div className="p-3 flex flex-col gap-1">
              {cfg.quickActions.map(({ to, icon, label, desc, color }) => (
                <QuickActionLink key={to} to={to} icon={icon} label={label} desc={desc} color={color} />
              ))}
            </div>
          </div>

          {/* Security card */}
          <div className={`bg-linear-to-br ${cfg.securityGrad} rounded-2xl shadow-md p-5 text-white`}>
            <div className="flex items-center gap-2 mb-4">
              <MdShield className="text-xl text-white/90" />
              <h3 className="font-bold text-sm">Bảo mật tài khoản</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Mật khẩu",        ok: true },
                { label: "Xác thực email",  ok: !!formData.email },
                { label: "Số điện thoại",   ok: !!formData.phoneNumber },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-white/80">{label}</span>
                  <span className={`flex items-center gap-1 font-bold ${ok ? "text-emerald-300" : "text-white/40"}`}>
                    {ok ? <MdCheckCircle /> : <MdWarning />}
                    {ok ? "Đã thiết lập" : "Chưa"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
                <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${securityPct}%` }} />
              </div>
              <p className="text-[11px] text-white/60">{securityPct}% hoàn thiện hồ sơ</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InternalProfile;
