import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import {
  MdEmail,
  MdLock,
  MdPerson,
  MdPhone,
  MdArrowForward,
  MdElectricCar,
  MdSmartToy,
  MdCalendarMonth,
  MdVerifiedUser,
} from "react-icons/md";
import { authService } from "../../services/api/authService";

import registerBackground from "../../assets/images/register.jpg";

// Feature Card Component
const FeatureCard = ({ icon: Icon, label, value }) => (
  <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-transform hover:-translate-y-1 duration-300">
    <div className="bg-white/80 p-2.5 rounded-full text-[#13A4EC]">
      <Icon className="text-2xl" />
    </div>
    <div>
      <p className="text-slate-700 text-xs font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-slate-900 font-bold text-sm">{value}</p>
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    DOB: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      // Gửi dữ liệu khớp với BE schema (không gửi confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);

      console.log("Register success:", response);
      setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display bg-white text-[#111618] antialiased fixed inset-0 overflow-hidden">
      <div className="flex h-full w-full">
        {/* Left Pane: Register Form */}
        <div className="flex-1 lg:w-2/5 flex items-center justify-center bg-white h-full p-8 sm:p-12 lg:p-16 overflow-y-auto">
          <div className="w-full max-w-[480px] flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-400/40">
                  <MdElectricCar className="text-[22px]" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                  EV Rental System
                </span>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 bg-clip-text text-transparent drop-shadow-sm">
                  Tạo Tài Khoản
                </span>
              </h1>
              <p className="text-gray-500 text-base">
                Vui lòng điền thông tin để đăng ký tài khoản.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 text-sm font-semibold">
                  Tên Đăng Nhập
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 pl-6 pr-14 pb-1 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#13A4EC] focus:bg-white focus:ring-2 focus:ring-[#13A4EC]/20 outline-none transition-all duration-200"
                    placeholder="nguyenvana"
                    required
                  />
                  <MdPerson className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 text-sm font-semibold">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 pl-6 pr-14 pb-1 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#13A4EC] focus:bg-white focus:ring-2 focus:ring-[#13A4EC]/20 outline-none transition-all duration-200"
                    placeholder="name@example.com"
                    required
                  />
                  <MdEmail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 text-sm font-semibold">
                  Số Điện Thoại
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 pl-6 pr-14 pb-1 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#13A4EC] focus:bg-white focus:ring-2 focus:ring-[#13A4EC]/20 outline-none transition-all duration-200"
                    placeholder="0123456789"
                    required
                    pattern="[0-9]{10}"
                    title="Vui lòng nhập số điện thoại 10 chữ số"
                  />
                  <MdPhone className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
              </div>

              {/* Date of Birth Field */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 text-sm font-semibold">
                  Ngày Sinh
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 pl-6 pr-4 pb-1 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#13A4EC] focus:bg-white focus:ring-2 focus:ring-[#13A4EC]/20 outline-none transition-all duration-200"
                    required
                    max={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18),
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 text-sm font-semibold">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 pl-6 pr-14 pb-1 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#13A4EC] focus:bg-white focus:ring-2 focus:ring-[#13A4EC]/20 outline-none transition-all duration-200"
                    placeholder="Nhập mật khẩu"
                    required
                    minLength="6"
                  />
                  <MdLock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 text-sm font-semibold">
                  Xác Nhận Mật Khẩu
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 pl-6 pr-14 pb-1 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#13A4EC] focus:bg-white focus:ring-2 focus:ring-[#13A4EC]/20 outline-none transition-all duration-200"
                    placeholder="Nhập lại mật khẩu"
                    required
                    minLength="6"
                  />
                  <MdLock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 w-full h-14 rounded-xl bg-[#13A4EC] text-base font-bold text-white transition-all duration-200 hover:bg-[#0d8fd4] hover:shadow-lg hover:shadow-[#13A4EC]/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang Đăng Ký...
                  </>
                ) : (
                  <>
                    Đăng Ký
                    <MdArrowForward className="text-[20px] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">
                Hoặc đăng ký với
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-3 h-14 rounded-xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <FcGoogle className="text-2xl" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 h-14 rounded-xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <FaFacebook className="text-2xl text-[#1877F2]" />
                Facebook
              </button>
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500 font-medium">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-[#13A4EC] font-bold hover:underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Pane: Visual Showcase */}
        <div
          className="hidden lg:flex lg:w-3/5 h-full relative flex-col justify-end p-12 bg-cover bg-center"
          style={{ backgroundImage: `url(${registerBackground})` }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent mix-blend-multiply pointer-events-none"></div>
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col gap-8 w-full max-w-lg">
            <div className="text-white">
              <h2 className="text-5xl font-bold leading-tight mb-2">
                Bắt Đầu Hành Trình
              </h2>
              <p className="text-lg opacity-90 font-medium">
                Trải nghiệm dịch vụ cho thuê xe thông minh nhất.
              </p>
            </div>

            {/* Floating Feature Cards (Glassmorphism) */}
            <div className="grid grid-cols-3 gap-4">
              <FeatureCard
                icon={MdSmartToy}
                label="AI Hỗ Trợ"
                value="Thông Minh"
              />
              <FeatureCard
                icon={MdCalendarMonth}
                label="Đặt Xe"
                value="Dễ Dàng"
              />
              <FeatureCard
                icon={MdVerifiedUser}
                label="An Toàn"
                value="Bảo Mật"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Register;
