import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdEdit,
  MdSave,
  MdClose,
  MdArrowBack,
  MdDirectionsCar,
  MdHistory,
  MdVerifiedUser,
  MdCheckCircle,
  MdWarning,
  MdElectricCar,
  MdPayment,
  MdShield,
} from "react-icons/md";
import { useAuthContext } from "../../context";
import { profileService, bookingService } from "../../services/api";

// ===================== HELPERS =====================
const autoFormatDate = (raw) => {
  let d = raw.replace(/[^0-9]/g, "");
  if (d.length > 8) d = d.slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};
const toISO = (dmy) => {
  const p = (dmy || "").split("/");
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : dmy;
};
const fromISO = (iso) => {
  const p = (iso || "").split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
};
const fmtCurrency = (n) =>
  n >= 1_000_000
    ? `${new Intl.NumberFormat("vi-VN").format(Math.round(n / 1_000_000))}M ₫`
    : `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;

const ROLE_LABEL = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  driver: "Tài xế",
  manager: "Quản lý",
};

// ===================== EDITABLE FIELD =====================
const Field = ({ icon: Icon, label, name, value, type, isEditing, onChange, placeholder, maxLength }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all duration-200 ${
        isEditing
          ? "bg-white border-sky-300 ring-2 ring-sky-100"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <Icon className={`text-lg shrink-0 ${isEditing ? "text-sky-500" : "text-gray-400"}`} />
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
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

// ===================== STAT CHIP =====================
const StatChip = ({ label, value, color }) => (
  <div className={`flex flex-col items-center justify-center px-5 py-4 rounded-2xl ${color}`}>
    <span className="text-2xl font-black text-gray-900">{value}</span>
    <span className="text-[11px] font-semibold text-gray-500 mt-0.5 text-center">{label}</span>
  </div>
);

// ===================== MAIN =====================
const Profile = () => {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [detectedRole, setDetectedRole] = useState(null);
  const [bookingStats, setBookingStats] = useState({ total: 0, completed: 0, active: 0, totalSpent: 0 });

  const canEdit = !!detectedRole;
  const emptyForm = { username: "", email: "", phoneNumber: "", DOB: "" };
  const [formData, setFormData] = useState(emptyForm);
  const originalData = useRef(emptyForm);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);

    const loadProfile = profileService.getProfile(user)
      .then((res) => {
        setDetectedRole(res?.detectedRole || null);
        const profile = {
          username: res?.username || user.username || "",
          email: res?.email || "",
          phoneNumber: res?.phoneNumber || "",
          DOB: res?.DOB ? fromISO(res.DOB.split("T")[0]) : "",
        };
        setFormData(profile);
        originalData.current = profile;
      })
      .catch(() => {
        setDetectedRole("customer");
        const profile = { username: user.username || "", email: "", phoneNumber: "", DOB: "" };
        setFormData(profile);
        originalData.current = profile;
      });

    const loadBookings = user?._id
      ? bookingService.getBookingsByCustomer(user._id)
          .then((res) => {
            const list = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : [];
            const completed = list.filter((b) => b.status === "completed").length;
            const active = list.filter((b) =>
              ["confirmed", "vehicle_delivered", "in_progress"].includes(b.status)
            ).length;
            const totalSpent = list
              .filter((b) => b.status === "completed")
              .reduce((s, b) => s + Number(b.totalAmount || 0), 0);
            setBookingStats({ total: list.length, completed, active, totalSpent });
          })
          .catch(() => {})
      : Promise.resolve();

    Promise.all([loadProfile, loadBookings]).finally(() => setIsLoading(false));
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDOBChange = (e) =>
    setFormData((prev) => ({ ...prev, DOB: autoFormatDate(e.target.value) }));

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await profileService.updateProfile(
        user,
        { username: formData.username, email: formData.email, phoneNumber: formData.phoneNumber, DOB: toISO(formData.DOB) || undefined },
        detectedRole
      );
      originalData.current = { ...formData };
      setIsEditing(false);
      setSaveMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message || "Lưu thất bại, vui lòng thử lại." });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="relative h-52 bg-linear-to-br from-sky-500 via-blue-500 to-indigo-600 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-300/20 rounded-full blur-2xl" />
        {[
          { top: "20%", left: "8%" },
          { top: "55%", left: "25%" },
          { top: "25%", right: "18%" },
          { top: "65%", right: "38%" },
        ].map((s, i) => (
          <div key={i} className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
            style={{ ...s, animationDelay: `${i * 0.4}s` }} />
        ))}
        <div className="absolute top-6 left-6 sm:left-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors group">
            <MdArrowBack className="group-hover:-translate-x-0.5 transition-transform" />
            Trang chủ
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 pb-16 relative z-10">

        {/* Profile hero card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-400/30">
                <span className="text-5xl font-black text-white select-none">{avatarLetter}</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{formData.username || "—"}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-100 text-sky-700 text-xs font-bold rounded-full">
                  <MdVerifiedUser className="text-xs" /> Đã xác thực
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-5">
                {ROLE_LABEL[detectedRole] || "Thành viên"} · EV Rental System
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip label="Tổng đặt xe" value={bookingStats.total} color="bg-sky-50" />
                <StatChip label="Hoàn thành" value={bookingStats.completed} color="bg-emerald-50" />
                <StatChip label="Đang thuê" value={bookingStats.active} color="bg-amber-50" />
                <StatChip
                  label="Đã chi tiêu"
                  value={bookingStats.totalSpent > 0 ? fmtCurrency(bookingStats.totalSpent) : "0 ₫"}
                  color="bg-purple-50"
                />
              </div>
            </div>

            {/* Buttons */}
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
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                    <MdClose className="text-base" /> Hủy
                  </button>
                  <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-60">
                    {isSaving ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : <MdSave className="text-base" />}
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              ) : canEdit ? (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-400/30 hover:-translate-y-0.5 transition-all">
                  <MdEdit className="text-base" /> Chỉnh sửa
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Info form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
              <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                <MdPerson className="text-sky-500 text-lg" />
              </div>
              <h2 className="font-bold text-gray-900">Thông tin cá nhân</h2>
              {isEditing && (
                <span className="ml-auto text-xs text-sky-500 bg-sky-50 px-2.5 py-1 rounded-full font-semibold">
                  Đang chỉnh sửa
                </span>
              )}
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
              <Field icon={MdPerson} label="Họ và tên" name="username" value={formData.username} type="text"
                isEditing={isEditing && canEdit} onChange={handleInputChange} />
              <Field icon={MdEmail} label="Email" name="email" value={formData.email} type="email"
                isEditing={isEditing && canEdit} onChange={handleInputChange} />
              <Field icon={MdPhone} label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} type="tel"
                isEditing={isEditing && canEdit} onChange={handleInputChange} />
              <Field icon={MdCalendarToday} label="Ngày sinh" name="DOB" value={formData.DOB} type="text"
                isEditing={isEditing && canEdit} onChange={handleDOBChange} placeholder="dd/mm/yyyy" maxLength={10} />
            </div>
            <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
              <MdShield className="text-gray-400 text-xl shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vai trò tài khoản</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">
                  {ROLE_LABEL[detectedRole] || "Thành viên"} — tài khoản đã được xác minh
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <MdCheckCircle /> Hợp lệ
              </span>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <MdDirectionsCar className="text-emerald-500 text-lg" />
                </div>
                <h2 className="font-bold text-gray-900">Thao tác nhanh</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {[
                  { to: "/history", icon: MdHistory, label: "Lịch sử thuê xe", desc: "Xem các chuyến đã đặt", active: "sky" },
                  { to: "/vehicles", icon: MdElectricCar, label: "Đặt xe ngay", desc: "Tìm & đặt chuyến mới", active: "emerald" },
                  { to: "/history", icon: MdPayment, label: "Lịch sử thanh toán", desc: "Xem giao dịch cọc", active: "purple" },
                ].map(({ to, icon: Icon, label, desc, active }) => (
                  <Link key={label} to={to}
                    className={`group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-${active}-50 hover:border-${active}-100 transition-all duration-200`}>
                    <div className={`w-10 h-10 bg-${active}-50 group-hover:bg-${active}-500 rounded-xl flex items-center justify-center transition-colors duration-200 shrink-0`}>
                      <Icon className={`text-lg text-${active}-500 group-hover:text-white transition-colors duration-200`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
                      <p className="text-xs text-gray-400 truncate">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Security card */}
            <div className="bg-linear-to-br from-sky-500 to-indigo-600 rounded-2xl shadow-md p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <MdShield className="text-xl text-white/90" />
                <h3 className="font-bold text-sm">Bảo mật tài khoản</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Mật khẩu", ok: true },
                  { label: "Xác thực email", ok: !!formData.email },
                  { label: "Số điện thoại", ok: !!formData.phoneNumber },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-white/80">{label}</span>
                    <span className={`flex items-center gap-1 font-bold ${ok ? "text-emerald-300" : "text-white/40"}`}>
                      {ok ? <MdCheckCircle /> : <MdWarning />}
                      {ok ? "Đã thiết lập" : "Chưa thiết lập"}
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
    </div>
  );
};

export default Profile;
