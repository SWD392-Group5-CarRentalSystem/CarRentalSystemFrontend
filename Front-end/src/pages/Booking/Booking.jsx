import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdDirectionsCar,
  MdPerson,
  MdLocationOn,
  MdCalendarToday,
  MdPhone,
  MdEmail,
  MdCheckCircle,
  MdArrowBack,
  MdArrowForward,
  MdInfo,
  MdPayment,
  MdAccessTime,
  MdLocalGasStation,
  MdAirlineSeatReclineNormal,
  MdSettings,
  MdElectricCar,
  MdPalette,
  MdBolt,
} from "react-icons/md";
import { useAuthContext } from "../../context/AuthContext";
import { bookingService, profileService, paymentService } from "../../services/api";
import { formatCurrency } from "../../utils/formatters";

// ===================== CONSTANTS =====================

const RENTAL_TYPES = {
  SELF_DRIVE: "self_drive",
  WITH_DRIVER: "with_driver",
};

const DRIVER_FEE_PER_DAY = 500000;

const POPULAR_LOCATIONS = [
  "Sân bay Tân Sơn Nhất, TP.HCM",
  "Sân bay Nội Bài, Hà Nội",
  "Sân bay Đà Nẵng",
  "Ga Sài Gòn, TP.HCM",
  "Ga Hà Nội",
  "Trung tâm Q.1, TP.HCM",
  "Trung tâm Hoàn Kiếm, Hà Nội",
  "Bãi biển Mỹ Khê, Đà Nẵng",
];

const STEPS = [
  { id: 1, label: "Thông tin thuê xe", icon: MdDirectionsCar },
  { id: 2, label: "Xác nhận & Thanh toán", icon: MdPayment },
];

// ===================== SUB-COMPONENTS =====================

/** Step Indicator — light theme */
const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-10">
    {STEPS.map((step, idx) => {
      const isActive = currentStep === step.id;
      const isCompleted = currentStep > step.id;
      const Icon = step.icon;
      return (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                  : isActive
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-200 scale-110"
                  : "bg-gray-100 text-gray-400 border-2 border-gray-200"
              }`}
            >
              {isCompleted ? (
                <MdCheckCircle className="text-xl" />
              ) : (
                <Icon className="text-xl" />
              )}
            </div>
            <span
              className={`mt-2 text-xs font-semibold ${
                isActive ? "text-sky-600" : isCompleted ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-16 sm:w-28 h-0.5 mx-3 mb-6 transition-all duration-500 ${
                isCompleted ? "bg-emerald-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

/** Vehicle Hero Card — large, full-info display */
const VehicleHeroCard = ({ vehicle }) => (
  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 hover:shadow-2xl transition-shadow duration-300">
    {/* Top: image */}
    <div className="relative h-52 sm:h-64 bg-linear-to-br from-sky-50 to-indigo-100 overflow-hidden">
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800";
        }}
      />
      {/* Status badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          <MdBolt className="text-sm" /> Xe điện
        </span>
      </div>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
      {/* Name overlay at bottom */}
      <div className="absolute bottom-4 left-5">
        <h2 className="text-white text-2xl font-black drop-shadow-lg">{vehicle.name}</h2>
        <p className="text-white/80 text-sm">{vehicle.description}</p>
      </div>
    </div>

    {/* Bottom: specs grid */}
    <div className="px-6 py-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <MdAirlineSeatReclineNormal className="text-sky-500 text-lg" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Số chỗ</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.seats || "—"} chỗ</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <MdSettings className="text-indigo-500 text-lg" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Hộp số</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.transmission || "Tự động"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <MdElectricCar className="text-emerald-500 text-lg" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Nhiên liệu</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.fuel || "Điện"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <MdPalette className="text-amber-500 text-lg" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Màu sắc</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.color || "—"}</p>
          </div>
        </div>
      </div>
      {vehicle.price > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Giá thuê</span>
          <div className="text-right">
            <span className="text-xl font-black text-sky-600">{formatCurrency(vehicle.price * 1000)}</span>
            <span className="text-xs text-gray-400 ml-1">/ ngày</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

/** Rental Type Card — light theme */
const RentalTypeCard = ({ type, selected, onSelect }) => {
  const isSelfDrive = type === RENTAL_TYPES.SELF_DRIVE;
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`flex-1 p-5 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer group ${
        selected
          ? "border-sky-500 bg-sky-50 shadow-lg shadow-sky-100"
          : "border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50/50"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
          selected ? "bg-sky-500 text-white shadow-md shadow-sky-200" : "bg-gray-100 text-gray-500 group-hover:bg-sky-100 group-hover:text-sky-600"
        }`}
      >
        {isSelfDrive ? (
          <MdDirectionsCar className="text-2xl" />
        ) : (
          <MdPerson className="text-2xl" />
        )}
      </div>
      <h4 className={`font-bold text-base mb-1 ${selected ? "text-sky-700" : "text-gray-800"}`}>
        {isSelfDrive ? "Tự lái" : "Có tài xế"}
      </h4>
      <p className="text-gray-500 text-xs leading-relaxed">
        {isSelfDrive
          ? "Bạn tự lái xe, linh hoạt và tự do di chuyển theo lịch trình."
          : `Có tài xế chuyên nghiệp đưa đón. Phụ thu ${formatCurrency(DRIVER_FEE_PER_DAY)}/ngày.`}
      </p>
      {selected && (
        <div className="mt-3 flex items-center gap-1 text-sky-600 text-xs font-bold">
          <MdCheckCircle /> Đã chọn
        </div>
      )}
    </button>
  );
};

/** Cost Breakdown Panel — light theme */
const CostBreakdown = ({ vehicle, rentalDays, rentalType }) => {
  const vehicleCost = vehicle.price * 1000 * rentalDays;
  const driverCost =
    rentalType === RENTAL_TYPES.WITH_DRIVER ? DRIVER_FEE_PER_DAY * rentalDays : 0;
  const totalAmount = vehicleCost + driverCost;
  const depositAmount = Math.round(totalAmount * 0.1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
      <h3 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
        <MdPayment className="text-sky-500" /> Chi phí dự kiến
      </h3>
      <div className="space-y-3 text-sm">
        {vehicle.price > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Thuê xe ({rentalDays} ngày × {formatCurrency(vehicle.price * 1000)})</span>
            <span className="font-semibold text-gray-800">{formatCurrency(vehicleCost)}</span>
          </div>
        )}
        {rentalType === RENTAL_TYPES.WITH_DRIVER && (
          <div className="flex justify-between text-gray-600">
            <span>Phí tài xế ({rentalDays} ngày × {formatCurrency(DRIVER_FEE_PER_DAY)})</span>
            <span className="font-semibold text-gray-800">{formatCurrency(driverCost)}</span>
          </div>
        )}
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <span className="text-gray-800 font-bold">Tổng cộng</span>
          <span className="text-sky-600 font-black text-xl">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl p-3">
          <span className="flex items-center gap-1.5 text-amber-700 text-sm font-semibold">
            <MdInfo className="text-amber-500" /> Đặt cọc 10%
          </span>
          <span className="font-black text-amber-700">{formatCurrency(depositAmount)}</span>
        </div>
      </div>
    </div>
  );
};

// ===================== HELPERS =====================

// dd/mm/yyyy helpers
const autoFormatDate = (raw) => {
  let d = raw.replace(/[^0-9]/g, "");
  if (d.length > 8) d = d.slice(0, 8);
  if (d.length > 4) return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0,2)}/${d.slice(2)}`;
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

const calcRentalDays = (start, end) => {
  if (!start || !end) return 1;
  const diff = Math.ceil((new Date(toISO(end)) - new Date(toISO(start))) / (1000 * 60 * 60 * 24));
  return diff < 1 ? 1 : diff;
};

const today = () => new Date().toISOString().split("T")[0];

const validateStep1 = (form) => {
  const errors = {};
  if (!form.rentalType) errors.rentalType = "Vui lòng chọn hình thức thuê xe";
  if (!form.startDate) errors.startDate = "Vui lòng chọn ngày nhận xe";
  if (!form.endDate) errors.endDate = "Vui lòng chọn ngày trả xe";
  if (form.startDate && form.endDate && toISO(form.endDate) <= toISO(form.startDate))
    errors.endDate = "Ngày trả xe phải sau ngày nhận";
  if (!form.pickupLocation.trim())
    errors.pickupLocation = "Vui lòng nhập địa điểm nhận xe";
  if (!form.dropoffLocation.trim())
    errors.dropoffLocation = "Vui lòng nhập địa điểm trả xe";
  return errors;
};

// ===================== NORMALIZER =====================
const normalizeVehicle = (v) => {
  if (!v) return null;
  if (v.name) return v;
  return {
    _id: v._id,
    id: v._id,
    name: v.vehicleName,
    description: `${v.vehicleType || ""} • ${v.vehicleDetail?.vehicleBrands || ""}`.replace(/^ • | • $/, "").trim(),
    image: v.vehicleDetail?.vehicleImage || "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    seats: v.vehicleDetail?.vehicleSeatCount,
    transmission: "Số tự động",
    fuel: "Điện",
    color: v.vehicleDetail?.vehicleColor,
    price: v.price ?? 0,
  };
};

// ===================== MAIN COMPONENT =====================

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const vehicle = normalizeVehicle(location.state?.selectedVehicle);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isRedirectingToVnpay, setIsRedirectingToVnpay] = useState(false);

  // Fetch full user info from DB (token chỉ có username)
  useEffect(() => {
    if (!user) return;
    profileService.getProfile(user)
      .then((data) => setUserProfile(data))
      .catch(() => {});
  }, [user]);

  // Helper: lấy field từ profile DB hoặc fallback về user context
  const profileField = (field) => userProfile?.[field] || user?.[field] || "—";

  // Read sessionStorage once (stable, won't change per render)
  const savedSearch = useRef(null);
  if (savedSearch.current === null) {
    try { savedSearch.current = JSON.parse(sessionStorage.getItem("bookingSearchData") || "null") ?? undefined; }
    catch { savedSearch.current = undefined; }
  }
  const prefill = location.state?.fromSearch ? location.state : (savedSearch.current || {});

  const [form, setForm] = useState({
    rentalType: prefill.rentalType || "",
    startDate: prefill.startDate ? fromISO(prefill.startDate) : "",
    endDate: prefill.endDate ? fromISO(prefill.endDate) : "",
    pickupLocation: prefill.pickupLocation || "",
    dropoffLocation: prefill.dropoffLocation || "",
  });

  const hasSavedSearch = Boolean(savedSearch.current);

  useEffect(() => {
    // Only redirect when there is no vehicle AND no search context at all
    if (!vehicle && !location.state?.fromSearch && !hasSavedSearch) navigate("/vehicles", { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle]);

  const rentalDays = useMemo(() => calcRentalDays(form.startDate, form.endDate), [form.startDate, form.endDate]);

  const costs = useMemo(() => {
    if (!vehicle) return { vehicleCost: 0, driverCost: 0, totalAmount: 0, depositAmount: 0 };
    const vehicleCost = vehicle.price * 1000 * rentalDays;
    const driverCost = form.rentalType === RENTAL_TYPES.WITH_DRIVER ? DRIVER_FEE_PER_DAY * rentalDays : 0;
    const totalAmount = vehicleCost + driverCost;
    const depositAmount = Math.round(totalAmount * 0.1);
    return { vehicleCost, driverCost, totalAmount, depositAmount };
  }, [vehicle, rentalDays, form.rentalType]);

  const filteredLocations = useMemo(
    () =>
      form.pickupLocation.trim()
        ? POPULAR_LOCATIONS.filter((l) => l.toLowerCase().includes(form.pickupLocation.toLowerCase()))
        : POPULAR_LOCATIONS,
    [form.pickupLocation]
  );

  const filteredDropoffLocations = useMemo(
    () =>
      form.dropoffLocation.trim()
        ? POPULAR_LOCATIONS.filter((l) => l.toLowerCase().includes(form.dropoffLocation.toLowerCase()))
        : POPULAR_LOCATIONS,
    [form.dropoffLocation]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const validationErrors = validateStep1(form);
      if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitBooking = async () => {
    if (isSubmitting || isRedirectingToVnpay) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      // Bước 1: Tạo booking (status: pending)
      const payload = {
        customerId: user?._id,
        vehicleId: vehicle._id ?? vehicle.id,
        rentalType: form.rentalType,
        startDate: new Date(toISO(form.startDate)).toISOString(),
        endDate: new Date(toISO(form.endDate)).toISOString(),
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        totalAmount: String(costs.totalAmount),
        depositAmount: String(costs.depositAmount),
      };
      const response = await bookingService.createBooking(payload);
      const booking = response?.data ?? response;

      if (!booking?._id) {
        throw new Error("Không tạo được đơn đặt xe. Vui lòng thử lại.");
      }

      // Bước 2: Lấy VNPay payment URL và redirect sang VNPay
      setIsRedirectingToVnpay(true);
      const paymentRes = await paymentService.createVnpayUrl(
        booking._id,
        Number(costs.depositAmount)
      );
      const paymentUrl = paymentRes?.data?.paymentUrl ?? paymentRes?.paymentUrl;

      if (!paymentUrl) {
        throw new Error("Không lấy được link thanh toán VNPay. Vui lòng thử lại.");
      }

      // Redirect sang VNPay sandbox để thanh toán cọc
      // Sau khi thanh toán xong, VNPay sẽ redirect về /payment/result
      window.location.href = paymentUrl;
      // KHÔNG advance step — trang sẽ chuyển sang VNPay
      return;
    } catch (err) {
      console.error("Booking/Payment error:", err);
      setErrors({
        submit: err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tạo thanh toán. Vui lòng thử lại.",
      });
      setIsRedirectingToVnpay(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Came from homepage search but no vehicle selected yet
  if (!vehicle && location.state?.fromSearch) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-12 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdDirectionsCar className="text-sky-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Chọn xe trước nhé!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Thông tin tìm kiếm của bạn đã được lưu:
          </p>
          <div className="bg-sky-50 rounded-xl p-4 text-sm text-left space-y-1.5 mb-8 border border-sky-100">
            {form.pickupLocation && <div><span className="text-gray-400 font-medium">Điểm đón:</span> <span className="text-gray-700 font-semibold">{form.pickupLocation}</span></div>}
            {form.startDate && <div><span className="text-gray-400 font-medium">Nhận xe:</span> <span className="text-gray-700 font-semibold">{new Date(form.startDate).toLocaleDateString("vi-VN")}</span></div>}
            {form.endDate && <div><span className="text-gray-400 font-medium">Trả xe:</span> <span className="text-gray-700 font-semibold">{new Date(form.endDate).toLocaleDateString("vi-VN")}</span></div>}
            {form.rentalType && <div><span className="text-gray-400 font-medium">Loại hình:</span> <span className="text-gray-700 font-semibold">{form.rentalType === "with_driver" ? "Có tài xế" : "Tự lái"}</span></div>}
          </div>
          <a
            href="/vehicles"
            className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-200 transition-all hover:-translate-y-0.5"
          >
            <MdDirectionsCar className="text-xl" />
            Chọn xe ngay
          </a>
          <p className="text-gray-400 text-xs mt-4">Sau khi chọn xe, thông tin ngày tháng sẽ được điền tự động</p>
        </div>
      </div>
    );
  }

  if (!vehicle) return null;

  // ===================== STEP 1 =====================
  const renderStep1 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left / main column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Vehicle hero card */}
        <VehicleHeroCard vehicle={vehicle} />

        {/* Rental type */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
          <label className="block text-gray-800 font-bold mb-3">
            Hình thức thuê xe <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <RentalTypeCard
              type={RENTAL_TYPES.SELF_DRIVE}
              selected={form.rentalType === RENTAL_TYPES.SELF_DRIVE}
              onSelect={(v) => updateField("rentalType", v)}
            />
            <RentalTypeCard
              type={RENTAL_TYPES.WITH_DRIVER}
              selected={form.rentalType === RENTAL_TYPES.WITH_DRIVER}
              onSelect={(v) => updateField("rentalType", v)}
            />
          </div>
          {errors.rentalType && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><MdInfo /> {errors.rentalType}</p>
          )}
        </div>

        {/* Date pickers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
          <label className="flex items-center gap-1.5 text-gray-800 font-bold mb-3">
            <MdCalendarToday className="text-sky-500" /> Thời gian thuê <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Ngày nhận xe</p>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={form.startDate}
                onChange={(e) => updateField("startDate", autoFormatDate(e.target.value))}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition ${errors.startDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Ngày trả xe</p>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={form.endDate}
                onChange={(e) => updateField("endDate", autoFormatDate(e.target.value))}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition ${errors.endDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>
          {form.startDate && form.endDate && toISO(form.endDate) > toISO(form.startDate) && (
            <div className="mt-3 flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-sky-700 text-sm font-semibold">
              <MdAccessTime className="text-sky-500" />
              Thời gian thuê: <strong>{rentalDays} ngày</strong>
            </div>
          )}
        </div>

        {/* Pickup location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 relative">
          <label className="flex items-center gap-1.5 text-gray-800 font-bold mb-3">
            <MdLocationOn className="text-sky-500" /> Địa điểm nhận xe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nhập hoặc chọn địa điểm nhận xe..."
            value={form.pickupLocation}
            onChange={(e) => updateField("pickupLocation", e.target.value)}
            onFocus={() => setShowLocSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition ${errors.pickupLocation ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          {errors.pickupLocation && (
            <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>
          )}
          {showLocSuggestions && filteredLocations.length > 0 && (
            <div className="absolute z-20 left-5 right-5 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
              {filteredLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onMouseDown={() => { updateField("pickupLocation", loc); setShowLocSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition flex items-center gap-2"
                >
                  <MdLocationOn className="text-sky-400 shrink-0" />
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropoff location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 relative">
          <label className="flex items-center gap-1.5 text-gray-800 font-bold mb-3">
            <MdLocationOn className="text-emerald-500" /> Địa điểm trả xe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nhập hoặc chọn địa điểm trả xe..."
            value={form.dropoffLocation}
            onChange={(e) => updateField("dropoffLocation", e.target.value)}
            onFocus={() => setShowDropoffSuggestions(true)}
            onBlur={() => setTimeout(() => setShowDropoffSuggestions(false), 200)}
            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition ${errors.dropoffLocation ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          {errors.dropoffLocation && (
            <p className="text-red-500 text-xs mt-1">{errors.dropoffLocation}</p>
          )}
          {showDropoffSuggestions && filteredDropoffLocations.length > 0 && (
            <div className="absolute z-20 left-5 right-5 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
              {filteredDropoffLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onMouseDown={() => { updateField("dropoffLocation", loc); setShowDropoffSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2"
                >
                  <MdLocationOn className="text-emerald-400 shrink-0" />
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column — sticky summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <CostBreakdown vehicle={vehicle} rentalDays={rentalDays} rentalType={form.rentalType} />

          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
            <h3 className="text-gray-800 font-bold text-sm mb-3 flex items-center gap-2">
              <MdPerson className="text-sky-500" /> Thông tin liên hệ
            </h3>
            {user ? (
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-gray-600">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <MdPerson className="text-sky-500 text-sm" />
                  </div>
                  <span className="font-medium">{profileField('username')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <MdEmail className="text-sky-500 text-sm" />
                  </div>
                  <span className="truncate">{profileField('email')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <MdPhone className="text-sky-500 text-sm" />
                  </div>
                  <span>{profileField('phoneNumber')}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Vui lòng đăng nhập để đặt xe</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ===================== STEP 2 =====================
  const renderStep2 = () => (
    <div className="max-w-3xl mx-auto space-y-5">
      <VehicleHeroCard vehicle={vehicle} />

      {/* Booking details review */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
        <h3 className="text-gray-800 font-bold text-lg mb-5 flex items-center gap-2">
          <MdDirectionsCar className="text-sky-500" /> Chi tiết đặt xe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Hình thức</span>
            <p className="text-gray-800 font-bold mt-1.5 flex items-center gap-2">
              {form.rentalType === RENTAL_TYPES.SELF_DRIVE ? (
                <><MdDirectionsCar className="text-sky-500" /> Tự lái</>
              ) : (
                <><MdPerson className="text-sky-500" /> Có tài xế</>
              )}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Thời gian</span>
            <p className="text-gray-800 font-bold mt-1.5 flex items-center gap-2">
              <MdAccessTime className="text-sky-500" /> {rentalDays} ngày
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Ngày nhận</span>
            <p className="text-gray-800 font-bold mt-1.5 flex items-center gap-2">
              <MdCalendarToday className="text-sky-500" />
              {new Date(form.startDate).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Ngày trả</span>
            <p className="text-gray-800 font-bold mt-1.5 flex items-center gap-2">
              <MdCalendarToday className="text-sky-500" />
              {new Date(form.endDate).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Địa điểm nhận xe</span>
            <p className="text-gray-800 font-bold mt-1.5 flex items-center gap-2">
              <MdLocationOn className="text-sky-500 shrink-0" /> {form.pickupLocation}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Địa điểm trả xe</span>
            <p className="text-gray-800 font-bold mt-1.5 flex items-center gap-2">
              <MdLocationOn className="text-emerald-500 shrink-0" /> {form.dropoffLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Customer info review */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
        <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
          <MdPerson className="text-sky-500" /> Thông tin người đặt
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs">Họ tên</span>
            <p className="text-gray-800 font-bold mt-1">{profileField('username')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs">Email</span>
            <p className="text-gray-800 font-bold mt-1 truncate">{profileField('email')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="text-gray-400 text-xs">Số điện thoại</span>
            <p className="text-gray-800 font-bold mt-1">{profileField('phoneNumber')}</p>
          </div>
        </div>
      </div>

      <CostBreakdown vehicle={vehicle} rentalDays={rentalDays} rentalType={form.rentalType} />

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm flex items-center gap-2">
          <MdInfo className="shrink-0 text-lg" /> {errors.submit}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-xs leading-relaxed">
        <MdInfo className="inline mr-1" />
        Bằng việc xác nhận đặt xe, bạn đồng ý với{" "}
        <span className="underline cursor-pointer font-semibold">Điều khoản dịch vụ</span> và{" "}
        <span className="underline cursor-pointer font-semibold">Chính sách hủy</span> của chúng tôi. Khoản đặt cọc 30% cần được thanh toán để xác nhận đơn.
      </div>
    </div>
  );

  // ===================== MAIN RENDER =====================
  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-white to-indigo-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-100 text-sky-600 text-xs font-bold rounded-full mb-3">
            <MdElectricCar /> Đặt xe điện cao cấp
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">Đặt xe ngay</h1>
          <p className="text-gray-500 text-sm">Hoàn tất thông tin để đặt xe nhanh chóng và tiện lợi</p>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {/* Navigation buttons — luôn hiện vì chỉ có 2 step */}
        {currentStep <= 2 && (
          <div className="flex justify-between items-center mt-8 max-w-3xl mx-auto">
            {currentStep > 1 ? (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition text-sm font-semibold cursor-pointer shadow-sm"
              >
                <MdArrowBack /> Quay lại
              </button>
            ) : (
              <button
                onClick={() => navigate("/vehicles")}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition text-sm font-semibold cursor-pointer shadow-sm"
              >
                <MdArrowBack /> Danh sách xe
              </button>
            )}

            {currentStep === 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition text-sm font-bold shadow-lg shadow-sky-200 cursor-pointer"
              >
                Tiếp tục <MdArrowForward />
              </button>
            ) : (
              <button
                onClick={handleSubmitBooking}
                disabled={isSubmitting || isRedirectingToVnpay}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition text-sm font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isRedirectingToVnpay ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang chuyển sang VNPay...
                  </>
                ) : isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <><MdCheckCircle /> Xác nhận đặt xe</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
