import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import {
  MdEmail,
  MdLock,
  MdArrowForward,
  MdElectricCar,
  MdSmartToy,
  MdCalendarMonth,
  MdVerifiedUser,
} from "react-icons/md";
import { authService } from "../../services/api/authService";

import loginBackground from "../../assets/images/login.png";

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

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(formData);
      console.log("Login success:", response);

      // Redirect to home or dashboard after successful login
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display bg-white text-[#111618] antialiased fixed inset-0 overflow-hidden">
      <div className="flex h-full w-full">
        {/* Left Pane: Visual Showcase */}
        <div
          className="hidden lg:flex lg:w-3/5 h-full relative flex-col justify-end p-12 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBackground})` }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent mix-blend-multiply pointer-events-none"></div>
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col gap-8 w-full max-w-lg">
            <div className="text-white">
              <h2 className="text-5xl font-bold leading-tight mb-2">
                Lái Xe Tương Lai
              </h2>
              <p className="text-lg opacity-90 font-medium">
                Trải nghiệm đội xe thông minh nhất hành tinh.
              </p>
            </div>

            {/* Floating Feature Cards (Glassmorphism) */}
            <div className="grid grid-cols-3 gap-4">
              <FeatureCard
                icon={MdSmartToy}
                label="Hỗ Trợ AI"
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

        {/* Right Pane: Login Form */}
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
                  Chào Mừng Trở Lại
                </span>
              </h1>
              <p className="text-gray-500 text-base">
                Vui lòng nhập thông tin để đăng nhập.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 text-sm font-semibold">
                  Địa Chỉ Email
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

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-gray-900 text-sm font-semibold">
                    Mật Khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[#13A4EC] text-sm font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-xl border border-gray-200 bg-gray-50 pl-6 pr-14 pb-1 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#13A4EC] focus:bg-white focus:ring-2 focus:ring-[#13A4EC]/20 outline-none transition-all duration-200"
                    placeholder="Nhập mật khẩu"
                    required
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
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng Nhập
                    <MdArrowForward className="text-[20px] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">
                Hoặc tiếp tục với
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
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-[#13A4EC] font-bold hover:underline"
                >
                  Đăng ký miễn phí
                </Link>
              </p>
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

export default Login;
