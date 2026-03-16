import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Search, Phone, Star, RefreshCw, Plus, X, Eye, EyeOff } from "lucide-react";
import { staffService } from "../../services/api";

const EMPTY_FORM = {
  username: "",
  email: "",
  phoneNumber: "",
  DOB: "",
  password: "",
  licenseNumber: "",
};

export default function Drivers() {
  const { setBreadcrumb } = useOutletContext();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create driver modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    setBreadcrumb({ title: "Quản lý tài xế" });
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await staffService.getAllDrivers();
      const raw = res?.data ?? res ?? [];
      setDrivers(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!form.username || !form.email || !form.phoneNumber || !form.DOB || !form.password || !form.licenseNumber) {
      setCreateError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }
    try {
      setCreating(true);
      await staffService.createDriver({
        ...form,
        licenseNumber: Number(form.licenseNumber),
      });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      await fetchDrivers();
    } catch (err) {
      console.error("Create driver error:", err);
      setCreateError(err?.response?.data?.message ?? err?.message ?? "Tạo tài xế thất bại");
    } finally {
      setCreating(false);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phoneNumber?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý tài xế</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {drivers.length} tài xế</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDrivers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} />
            <span className="font-medium">Làm mới</span>
          </button>
          <button
            onClick={() => { setShowCreate(true); setCreateError(""); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
          >
            <Plus size={16} />
            <span className="font-medium">Thêm tài xế</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <div
            key={driver._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
          >
            <div className="bg-linear-to-br from-blue-500 to-cyan-500 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    {driver.username?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{driver.username ?? "N/A"}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={16} className="fill-yellow-300 text-yellow-300" />
                      <span className="font-semibold">{Number(driver.Rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={18} className="text-blue-500" />
                  <span className="text-sm">{driver.phoneNumber || "Chưa có"}</span>
                </div>
                {driver.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-xs text-gray-400 w-5">@</span>
                    <span className="text-sm">{driver.email}</span>
                  </div>
                )}
                {driver.licenseNumber && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-xs text-gray-400 w-5">#</span>
                    <span className="text-sm">GPLX: {driver.licenseNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-2 pb-4 border-t border-gray-100 pt-4">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200">
                  Hoạt động
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy tài xế nào</p>
          <p className="text-gray-400 text-sm mt-1">Nhấn &ldquo;Thêm tài xế&rdquo; để tạo tài khoản tài xế đầu tiên</p>
        </div>
      )}

      {/* Create Driver Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Thêm tài xế mới</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateDriver} className="px-6 py-4 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Họ tên *</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="driver@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày sinh *</label>
                  <input
                    type="date"
                    value={form.DOB}
                    onChange={(e) => setForm({ ...form, DOB: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Số GPLX *</label>
                  <input
                    type="number"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu *</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mật khẩu đăng nhập"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? "Đang tạo..." : "Tạo tài xế"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
