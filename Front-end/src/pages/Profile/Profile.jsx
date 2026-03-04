import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdLocationOn,
  MdEdit,
  MdSave,
  MdClose,
  MdArrowBack,
  MdDirectionsCar,
  MdHistory,
  MdVerifiedUser,
  MdCameraAlt,
  MdStar,
  MdTrendingUp,
  MdElectricCar,
  MdCheck,
  MdWarning,
  MdCheckCircle,
} from "react-icons/md";
import { useAuthContext } from "../../context";
import { profileService } from "../../services/api";

// Animated Stat Card Component
const StatCard = ({ icon: Icon, value, label, color, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}
      >
        <Icon className="text-2xl text-white" />
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  delay: PropTypes.number.isRequired,
};

// Editable Field Component
const EditableField = ({
  icon: Icon,
  label,
  value,
  name,
  type,
  isEditing,
  onChange,
}) => {
  return (
    <div className="group">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all duration-300 group-hover:border-sky-300 group-hover:bg-white">
        <Icon className="text-gray-400 text-xl flex-shrink-0 group-hover:text-sky-500 transition-colors" />
        {isEditing ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="bg-transparent border-none p-0 focus:ring-0 w-full text-sm font-medium text-gray-900 outline-none"
          />
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {value || "Chưa cập nhật"}
          </span>
        )}
      </div>
    </div>
  );
};

EditableField.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// Achievement Badge Component
const AchievementBadge = ({
  icon: Icon,
  title,
  description,
  unlocked,
  delay,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`relative p-4 rounded-2xl transition-all duration-500 transform ${
        unlocked
          ? "bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200"
          : "bg-gray-50 border border-gray-200 opacity-60"
      } ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {unlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
          <MdCheck className="text-white text-sm" />
        </div>
      )}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
          unlocked ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-400"
        }`}
      >
        <Icon className="text-2xl" />
      </div>
      <h4
        className={`font-bold text-sm mb-1 ${unlocked ? "text-gray-900" : "text-gray-500"}`}
      >
        {title}
      </h4>
      <p className={`text-xs ${unlocked ? "text-gray-500" : "text-gray-400"}`}>
        {description}
      </p>
    </div>
  );
};

AchievementBadge.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  unlocked: PropTypes.bool.isRequired,
  delay: PropTypes.number.isRequired,
};

const Profile = () => {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const [detectedRole, setDetectedRole] = useState(null); // role thực từ DB

  // canEdit: tất cả role đều có thể chỉnh sửa (customer dùng /auth/user/:id)
  const canEdit = !!detectedRole;

  const emptyForm = { username: "", email: "", phoneNumber: "", DOB: "" };
  const [formData, setFormData] = useState(emptyForm);
  const originalData = useRef(emptyForm);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    profileService
      .getProfile(user)
      .then((res) => {
        // axios interceptor trả response.data = { success, message, data: {...} }
        // profileService spread res.data nên res ở đây là staff/driver object trực tiếp
        // kèm detectedRole
        const role = res?.detectedRole || null;
        setDetectedRole(role);
        const profile = {
          username: res?.username || user.username || "",
          email: res?.email || "",
          phoneNumber: res?.phoneNumber || "",
          DOB: res?.DOB ? res.DOB.split("T")[0] : "",
        };
        setFormData(profile);
        originalData.current = profile;
      })
      .catch(() => {
        // Customer: không có endpoint trong BE
        const profile = {
          username: user.username || "",
          email: "",
          phoneNumber: "",
          DOB: "",
        };
        setDetectedRole('customer');
        setFormData(profile);
        originalData.current = profile;
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await profileService.updateProfile(user, {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        DOB: formData.DOB || undefined,
      }, detectedRole);
      originalData.current = { ...formData };
      setIsEditing(false);
      setSaveMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Lưu thất bại, vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...originalData.current });
    setIsEditing(false);
    setSaveMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-sky-200 rounded-full animate-spin border-t-sky-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MdElectricCar className="text-sky-500 text-xl animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">
            Đang tải thông tin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-sky-500 via-blue-500 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-white rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-300 rounded-full filter blur-[120px] animate-pulse"></div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-white/40 rounded-full animate-float"></div>
          <div
            className="absolute top-40 left-[30%] w-3 h-3 bg-white/30 rounded-full animate-float"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-16 right-[20%] w-2 h-2 bg-white/50 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-32 right-[40%] w-4 h-4 bg-white/20 rounded-full animate-float"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
        >
          <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Quay lại trang chủ</span>
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 animate-slide-up">
          <div className="relative px-8 pt-8 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div
                className="relative -mt-20 md:-mt-24"
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-2xl transform transition-transform duration-300 hover:scale-105">
                  {formData.username ? (
                    <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-5xl font-black select-none">
                        {formData.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MdPerson className="text-gray-400 text-5xl" />
                    </div>
                  )}
                </div>
                <button
                  className={`absolute bottom-2 right-2 w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                    avatarHover ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  }`}
                >
                  <MdCameraAlt className="text-lg" />
                </button>
                {/* Online indicator */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                    {formData.username}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                      <MdVerifiedUser className="text-sm" />
                      Đã xác thực
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full flex items-center gap-1">
                      <MdStar className="text-sm" />
                      VIP Member
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 mb-4">
                  <span className="capitalize">{detectedRole || user?.role || 'Thành viên'}</span>
                </p>
              </div>

              {/* Edit Button */}
              <div className="flex flex-col items-end gap-2">
                {saveMessage && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                    saveMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {saveMessage.type === 'success' ? <MdCheckCircle /> : <MdWarning />}
                    {saveMessage.text}
                  </div>
                )}
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <MdClose />
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-sm text-white transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-60"
                      >
                        {isSaving ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : <MdSave />}
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </>
                  ) : canEdit ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-sky-500 hover:bg-sky-600 rounded-xl font-bold text-sm text-white transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transform hover:-translate-y-0.5"
                    >
                      <MdEdit />
                      Chỉnh sửa
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Achievements */}
          <div className="lg:col-span-1 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={MdDirectionsCar}
                value="—"
                label="Chuyến đi"
                color="bg-sky-500"
                delay={100}
              />
              <StatCard
                icon={MdTrendingUp}
                value="—"
                label="Đã di chuyển"
                color="bg-emerald-500"
                delay={200}
              />
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MdStar className="text-amber-500" />
                Thành tựu
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <AchievementBadge
                  icon={MdDirectionsCar}
                  title="Lái xe mới"
                  description="Hoàn thành chuyến đầu tiên"
                  unlocked={true}
                  delay={100}
                />
                <AchievementBadge
                  icon={MdElectricCar}
                  title="Eco Warrior"
                  description="Đi 500km bằng xe điện"
                  unlocked={true}
                  delay={200}
                />
                <AchievementBadge
                  icon={MdStar}
                  title="5 sao"
                  description="Nhận 10 đánh giá 5 sao"
                  unlocked={true}
                  delay={300}
                />
                <AchievementBadge
                  icon={MdVerifiedUser}
                  title="VIP"
                  description="Thuê 50 chuyến"
                  unlocked={false}
                  delay={400}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-100">
                <div className="flex">
                  <button className="flex-1 px-6 py-4 text-sm font-bold text-sky-500 border-b-2 border-sky-500 transition-colors">
                    Thông tin cá nhân
                  </button>
                  <button className="flex-1 px-6 py-4 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
                    Bảo mật
                  </button>
                  <button className="flex-1 px-6 py-4 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
                    Thanh toán
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <EditableField
                    icon={MdPerson}
                    label="Họ và tên"
                    value={formData.username}
                    name="username"
                    type="text"
                    isEditing={isEditing && canEdit}
                    onChange={handleInputChange}
                  />
                  <EditableField
                    icon={MdEmail}
                    label="Email"
                    value={formData.email}
                    name="email"
                    type="email"
                    isEditing={isEditing && canEdit}
                    onChange={handleInputChange}
                  />
                  <EditableField
                    icon={MdPhone}
                    label="Số điện thoại"
                    value={formData.phoneNumber}
                    name="phoneNumber"
                    type="tel"
                    isEditing={isEditing && canEdit}
                    onChange={handleInputChange}
                  />
                  <EditableField
                    icon={MdCalendarToday}
                    label="Ngày sinh"
                    value={formData.DOB}
                    name="DOB"
                    type="date"
                    isEditing={isEditing && canEdit}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Quick Actions */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Thao tác nhanh
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                      to="/history"
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-sky-50 rounded-xl transition-all duration-300 group hover:shadow-md"
                    >
                      <div className="w-12 h-12 bg-sky-100 group-hover:bg-sky-500 rounded-xl flex items-center justify-center transition-colors">
                        <MdHistory className="text-2xl text-sky-500 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Lịch sử
                      </span>
                    </Link>
                    <Link
                      to="/booking"
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-all duration-300 group hover:shadow-md"
                    >
                      <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-colors">
                        <MdDirectionsCar className="text-2xl text-emerald-500 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Đặt xe
                      </span>
                    </Link>
                    <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-amber-50 rounded-xl transition-all duration-300 group hover:shadow-md">
                      <div className="w-12 h-12 bg-amber-100 group-hover:bg-amber-500 rounded-xl flex items-center justify-center transition-colors">
                        <MdStar className="text-2xl text-amber-500 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Đánh giá
                      </span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all duration-300 group hover:shadow-md">
                      <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-500 rounded-xl flex items-center justify-center transition-colors">
                        <MdVerifiedUser className="text-2xl text-purple-500 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Hỗ trợ
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
